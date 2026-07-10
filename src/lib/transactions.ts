import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { createManualTransaction } from "@/lib/persist-transaction";

export type TransactionRowData = {
  id: string;
  merchant: string;
  /** True underlying value (may be null) -- for edit-form prefill, not display. */
  merchantRaw: string | null;
  categoryId: string | null;
  categoryName: string | null;
  categoryColor: string | null;
  accountId: string | null;
  account: string;
  /** Pre-formatted, sign-and-currency included -- for display. */
  amount: string;
  /** Raw positive amount -- for edit-form prefill. */
  amountRaw: number;
  /** "in" | "out" -- for edit-form prefill (the Expense/Income toggle). */
  direction: string;
  /** Relative, e.g. "Today" -- for display. */
  date: string;
  /** ISO YYYY-MM-DD -- for edit-form prefill (the date input). */
  transactionDateRaw: string;
  source: "imported" | "manual";
};

export type TransactionInput = {
  merchant: string;
  amount: number;
  direction: string;
  accountId: string | null;
  categoryId: string | null;
  date: string;
};

export type TransactionDateRange =
  | "today"
  | "yesterday"
  | "last7"
  | "thisMonth"
  | "lastMonth"
  | "thisYear"
  | "custom";

export type TransactionFilters = {
  /** Matched against merchant, account name, and category name (case-insensitive). */
  search?: string;
  /** A real Account id, "unassigned", or omitted for all accounts. */
  accountId?: string;
  /** A real Category id, "uncategorized", or omitted for all categories. */
  categoryId?: string;
  range?: TransactionDateRange;
  /** ISO YYYY-MM-DD, only used when range === "custom". */
  customFrom?: string;
  customTo?: string;
  /** "expense" -> direction "out", "income" -> direction "in", omitted for all. */
  type?: "expense" | "income";
  /** "gmail" (displayed as "Imported") or "manual", omitted for all. */
  source?: "gmail" | "manual";
};

export type TransactionSort =
  | "newest"
  | "oldest"
  | "amountDesc"
  | "amountAsc"
  | "merchantAsc"
  | "merchantDesc";

export type GetTransactionsOptions = {
  limit?: number;
  filters?: TransactionFilters;
  sort?: TransactionSort;
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  SGD: "S$",
};

function formatAmount(amountNumber: number, currency: string, direction: string): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? `${currency} `;
  const sign = direction === "in" ? "+" : "-";
  const value = amountNumber.toLocaleString("en-SG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${sign}${symbol}${value}`;
}

// Reproduces the Dashboard V2 placeholder's date convention (Today /
// Yesterday / N days ago), falling back to a short absolute date beyond
// that window.
export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((startOfToday.getTime() - startOfDate.getTime()) / 86_400_000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays > 1 && diffDays <= 6) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-SG", { day: "numeric", month: "short" });
}

// Prefers the linked Account's name (set via manual entry, or via editing
// a Gmail-imported row to assign one) over the raw bank string extracted
// from the email -- falls back to bank for legacy rows with no assigned
// account, so existing transactions display identically until assigned.
function formatAccountLabel(
  accountName: string | null,
  bank: string | null,
  cardLastFour: string | null,
): string {
  const name = accountName ?? bank ?? "Unassigned";
  return cardLastFour ? `${name} •••• ${cardLastFour}` : name;
}

// Constructed via Date.UTC, not `new Date(y, m, d)` -- the latter builds a
// LOCAL midnight instant, which on a server running east of UTC (this one
// runs in Asia/Singapore, UTC+8) lands on the *previous* UTC calendar day
// (e.g. local midnight July 10 SGT = 16:00 UTC July 9). Since
// transactionDate is a bare @db.Date column with no time-of-day, its
// values are compared against the UTC calendar date of whatever bound is
// supplied -- a locally-constructed bound would silently filter for the
// wrong day. Date.UTC(y, m, d) instead pins exactly the intended calendar
// date, matching how transactionDate is already written elsewhere
// (new Date("YYYY-MM-DD"), which the spec parses as UTC midnight).
function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

function addUtcDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

// Computes the [gte, lt) bounds for each named range against
// transactionDate (date-only) -- "Last 7 Days" is inclusive of today (a
// 7-day window, not 6). Returns {} (no bound) for an unset/unknown range,
// which getTransactions() treats as "All Time."
function getDateRangeBounds(filters?: TransactionFilters): { gte?: Date; lt?: Date } {
  const todayStart = startOfUtcDay(new Date());

  switch (filters?.range) {
    case "today":
      return { gte: todayStart, lt: addUtcDays(todayStart, 1) };
    case "yesterday":
      return { gte: addUtcDays(todayStart, -1), lt: todayStart };
    case "last7":
      return { gte: addUtcDays(todayStart, -6), lt: addUtcDays(todayStart, 1) };
    case "thisMonth": {
      const now = new Date();
      return {
        gte: new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1)),
        lt: new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 1)),
      };
    }
    case "lastMonth": {
      const now = new Date();
      return {
        gte: new Date(Date.UTC(now.getFullYear(), now.getMonth() - 1, 1)),
        lt: new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1)),
      };
    }
    case "thisYear": {
      const now = new Date();
      return {
        gte: new Date(Date.UTC(now.getFullYear(), 0, 1)),
        lt: new Date(Date.UTC(now.getFullYear() + 1, 0, 1)),
      };
    }
    case "custom":
      return {
        gte: filters?.customFrom ? new Date(filters.customFrom) : undefined,
        lt: filters?.customTo ? addUtcDays(new Date(filters.customTo), 1) : undefined,
      };
    default:
      return {};
  }
}

// v1 stopgap for the Account filter: Gmail-imported transactions don't
// carry accountId yet (see the recommendation at the bottom of this file),
// only `bank` and, for card transactions, `cardLastFour`. Filtering "by
// account" therefore has to fall back to the same bank/card signal a
// human already uses to recognize which account a transaction belongs to
// -- otherwise selecting e.g. "UOB Preferred Platinum Visa" would return
// nothing, since no imported transaction has that accountId set.
//
// Keyed by account NAME because Account has no bank/card-issuer field of
// its own today -- fragile if an account is ever renamed, but this is
// explicitly a temporary query-layer patch, not the long-term model.
// `cardLastFour: undefined` means "don't constrain by card" (Citibank --
// only one Citibank account exists, so bank alone disambiguates it);
// `null` means "must have no card" (OCBC's current account, to exclude
// any future OCBC card); a string means "must equal exactly."
type AccountBankMatch = { bank: string; cardLastFour?: string | null };

const ACCOUNT_BANK_MATCH: Record<string, AccountBankMatch> = {
  "OCBC Current Account": { bank: "OCBC", cardLastFour: null },
  "UOB Preferred Platinum Visa (PPV)": { bank: "UOB", cardLastFour: "8360" },
  "DBS Altitude": { bank: "DBS", cardLastFour: "6106" },
  "DBS Woman's World Mastercard (WWMC)": { bank: "DBS", cardLastFour: "3977" },
  "Citibank Rewards": { bank: "Citibank" },
  // Mari Invest SavePlus / Mari Invest Income intentionally absent -- no
  // bank sends these, so only manually-entered transactions explicitly
  // assigned via accountId can ever belong to them.
};

// Resolves the Account filter to whichever transactions should count as
// "belonging" to it: anything explicitly linked via accountId (manual
// entries, or a Gmail transaction someone has since assigned via Edit)
// OR'd with the bank/card heuristic above, when one exists for that
// account. Falls back to accountId alone if the account has no bank
// mapping (Mari Invest) or no longer exists.
async function resolveAccountFilterWhere(accountId: string): Promise<Prisma.TransactionWhereInput> {
  const account = await prisma.account.findUnique({ where: { id: accountId } });
  if (!account) return { accountId };

  const bankMatch = ACCOUNT_BANK_MATCH[account.name];
  if (!bankMatch) return { accountId: account.id };

  return {
    OR: [
      { accountId: account.id },
      {
        bank: bankMatch.bank,
        ...(bankMatch.cardLastFour !== undefined ? { cardLastFour: bankMatch.cardLastFour } : {}),
      },
    ],
  };
}

// Each filter dimension is pushed as its own item in a top-level AND array
// rather than merged into one flat object -- both the free-text search and
// the account-filter resolution can independently need their own OR
// clause (search: merchant/account/category; account: accountId-or-bank-
// match), and merging two OR clauses into a single object would silently
// clobber one with the other instead of requiring both.
async function buildWhereClause(filters?: TransactionFilters): Promise<Prisma.TransactionWhereInput> {
  if (!filters) return {};
  const conditions: Prisma.TransactionWhereInput[] = [];

  const search = filters.search?.trim();
  if (search) {
    conditions.push({
      OR: [
        { merchant: { contains: search, mode: "insensitive" } },
        { account: { name: { contains: search, mode: "insensitive" } } },
        { category: { name: { contains: search, mode: "insensitive" } } },
      ],
    });
  }

  if (filters.accountId === "unassigned") {
    conditions.push({ accountId: null });
  } else if (filters.accountId && filters.accountId !== "all") {
    conditions.push(await resolveAccountFilterWhere(filters.accountId));
  }

  if (filters.categoryId === "uncategorized") {
    conditions.push({ categoryId: null });
  } else if (filters.categoryId && filters.categoryId !== "all") {
    conditions.push({ categoryId: filters.categoryId });
  }

  const { gte, lt } = getDateRangeBounds(filters);
  if (gte || lt) {
    conditions.push({ transactionDate: { ...(gte ? { gte } : {}), ...(lt ? { lt } : {}) } });
  }

  if (filters.type === "expense") conditions.push({ direction: "out" });
  else if (filters.type === "income") conditions.push({ direction: "in" });

  if (filters.source === "gmail" || filters.source === "manual") {
    conditions.push({ source: filters.source });
  }

  return conditions.length > 0 ? { AND: conditions } : {};
}

function buildOrderBy(sort?: TransactionSort): Prisma.TransactionOrderByWithRelationInput[] {
  switch (sort) {
    case "oldest":
      return [{ transactionDate: "asc" }, { createdAt: "asc" }];
    case "amountDesc":
      return [{ amount: "desc" }];
    case "amountAsc":
      return [{ amount: "asc" }];
    case "merchantAsc":
      return [{ merchant: "asc" }];
    case "merchantDesc":
      return [{ merchant: "desc" }];
    case "newest":
    default:
      return [{ transactionDate: "desc" }, { createdAt: "desc" }];
  }
}

export async function getTransactions(
  options: GetTransactionsOptions = {},
): Promise<TransactionRowData[]> {
  const { limit, filters, sort } = options;
  const rows = await prisma.transaction.findMany({
    where: await buildWhereClause(filters),
    include: { category: true, account: true },
    orderBy: buildOrderBy(sort),
    ...(limit !== undefined ? { take: limit } : {}),
  });

  return rows.map((row) => ({
    id: row.id,
    merchant: row.merchant ?? "Unknown merchant",
    merchantRaw: row.merchant,
    categoryId: row.categoryId,
    categoryName: row.category?.name ?? null,
    categoryColor: row.category?.color ?? null,
    accountId: row.accountId,
    account: formatAccountLabel(row.account?.name ?? null, row.bank, row.cardLastFour),
    amount: formatAmount(row.amount.toNumber(), row.currency, row.direction),
    amountRaw: row.amount.toNumber(),
    direction: row.direction,
    date: formatRelativeDate(row.transactionDate),
    transactionDateRaw: row.transactionDate.toISOString().slice(0, 10),
    source: row.source === "manual" ? "manual" : "imported",
  }));
}

export async function getTransactionCount(): Promise<number> {
  return prisma.transaction.count();
}

// Sets categorySource to "manual" whenever a category is assigned this way
// -- never null it out silently -- so a future rule re-run or AI
// categorisation can recognize and skip transactions the user categorised
// by hand. Clearing back to Uncategorized (categoryId: null) also clears
// categorySource, since there's no source for an unset category.
export async function setTransactionCategory(
  transactionId: string,
  categoryId: string | null,
): Promise<void> {
  await prisma.transaction.update({
    where: { id: transactionId },
    data: { categoryId, categorySource: categoryId ? "manual" : null },
  });
}

// Manual entries default to "purchase"/"deposit" -- transactionKind isn't
// an editable field (not in the Transaction CRUD field list) and nothing
// reads it for any live calculation; it's informational only.
export async function createTransaction(input: TransactionInput): Promise<void> {
  await createManualTransaction({
    merchant: input.merchant,
    amount: input.amount,
    currency: "SGD",
    transactionKind: input.direction === "out" ? "purchase" : "deposit",
    direction: input.direction,
    date: input.date,
    accountId: input.accountId,
    categoryId: input.categoryId,
    categorySource: input.categoryId ? "manual" : null,
  });
}

// Touches only the financial fields the Transaction CRUD feature exposes
// for editing -- gmailMessageId, gmailThreadId, gmailReceivedAt, source,
// bank, cardLastFour, and transactionKind are deliberately absent from
// this update, so a Gmail-imported row's email audit trail is never
// touched by an edit. Same categorySource invariant as
// setTransactionCategory(): "manual" whenever a category is chosen here,
// null when cleared back to Uncategorized -- a manual edit always wins
// over rule-based categorisation.
export async function updateTransaction(id: string, input: TransactionInput): Promise<void> {
  await prisma.transaction.update({
    where: { id },
    data: {
      merchant: input.merchant,
      amount: input.amount,
      direction: input.direction,
      transactionDate: new Date(input.date),
      accountId: input.accountId,
      categoryId: input.categoryId,
      categorySource: input.categoryId ? "manual" : null,
    },
  });
}

// Hard delete, per the "no soft deletes" design philosophy -- removes only
// the Transaction row. Gmail metadata lives entirely outside this database
// (in the user's actual mailbox), so this can never touch it. Note: this
// does remove the row's dedup protection, so an explicit later re-run of
// Historical Import over the same date range would re-import it -- an
// accepted consequence of "no soft deletes," not something this guards
// against.
export async function deleteTransaction(id: string): Promise<void> {
  await prisma.transaction.delete({ where: { id } });
}

// --- Recommendation (not implemented): resolving accountId at import time ---
//
// ACCOUNT_BANK_MATCH above is a query-layer stopgap: it lets the Account
// filter work today without touching the schema or backfilling data, but
// it has real costs -- it's keyed by account name (silently breaks if an
// account is renamed), it lives in a second place separate from the
// Account row itself, and every other feature that could benefit from
// knowing "which account does this transaction belong to" (the baseline
// balance calculation, Monthly Commitments matching, any future reporting
// by account) still can't see it, because it only exists inside this one
// filter's query.
//
// The more durable fix: have persistTransaction() (persist-transaction.ts)
// resolve and persist a real accountId for every newly-imported Gmail
// transaction, the same way it already auto-resolves categoryId via
// matchCategoryForMerchant(). Concretely:
//   1. Populate Account.cardLastFour for the credit-card accounts (the
//      field already exists on the schema for exactly this purpose --
//      it's just unpopulated today).
//   2. Add a small resolver, e.g. matchAccountForTransaction(bank,
//      cardLastFour), mirroring ACCOUNT_BANK_MATCH's logic but querying
//      Account rows directly (bank derived from name or a new field,
//      cardLastFour compared against Account.cardLastFour) instead of a
//      hardcoded table -- self-updating as accounts are added/renamed.
//   3. Call it from persistTransaction()'s create path, exactly like the
//      existing categoryId auto-match.
// That would make ACCOUNT_BANK_MATCH (and the "unassigned" filter option)
// obsolete for anything imported after the change, while this query-layer
// fallback keeps working unmodified for older, not-yet-assigned rows in
// the meantime. Retroactively backfilling accountId on existing imported
// transactions would be a separate, deliberate decision (a one-off
// script, not something to do silently) -- not proposed here.
