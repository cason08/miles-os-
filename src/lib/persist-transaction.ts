import { prisma } from "@/lib/db";
import type { Transaction } from "@/lib/transaction";
import { matchCategoryForMerchant } from "@/lib/merchant-rules";

export type PersistedTransaction = {
  id: string;
  gmailMessageId: string | null;
  gmailThreadId: string | null;
  gmailReceivedAt: string | null;
  bank: string | null;
  merchant: string | null;
  amount: number;
  currency: string;
  transactionKind: string;
  direction: string;
  cardLastFour: string | null;
  transactionDate: string;
  createdAt: string;
};

type PersistableRow = {
  id: string;
  gmailMessageId: string | null;
  gmailThreadId: string | null;
  gmailReceivedAt: Date | null;
  bank: string | null;
  merchant: string | null;
  amount: { toNumber(): number };
  currency: string;
  transactionKind: string;
  direction: string;
  cardLastFour: string | null;
  transactionDate: Date;
  createdAt: Date;
};

function toPersistedTransaction(row: PersistableRow): PersistedTransaction {
  return {
    id: row.id,
    gmailMessageId: row.gmailMessageId,
    gmailThreadId: row.gmailThreadId,
    gmailReceivedAt: row.gmailReceivedAt ? row.gmailReceivedAt.toISOString() : null,
    bank: row.bank,
    merchant: row.merchant,
    amount: row.amount.toNumber(),
    currency: row.currency,
    transactionKind: row.transactionKind,
    direction: row.direction,
    cardLastFour: row.cardLastFour,
    transactionDate: row.transactionDate.toISOString().slice(0, 10),
    createdAt: row.createdAt.toISOString(),
  };
}

// The Gmail-import engine -- used by both Historical Import and Daily
// Sync, unchanged in behavior. Always auto-matches a category via
// merchant rules (nobody's looking at a category dropdown during an
// import), always source: "gmail".
export async function persistTransaction(
  transaction: Transaction,
  gmail: { messageId: string; threadId: string; receivedAtIso: string | null },
): Promise<PersistedTransaction> {
  const gmailReceivedAt = gmail.receivedAtIso ? new Date(gmail.receivedAtIso) : new Date();

  // Only ever runs for a genuinely new transaction (the `create` branch
  // below) -- an already-persisted row is never touched, so this can never
  // override a manual categorisation. categorySource is only set alongside
  // a match, so an unmatched transaction stays fully uncategorized, same as
  // before this existed.
  const matchedCategoryId = await matchCategoryForMerchant(transaction.merchant);

  // Upsert on the unique gmailMessageId with an empty update: re-extracting
  // an already-persisted email is a no-op that returns the existing row,
  // rather than erroring on the unique constraint or creating a duplicate.
  // Reprocessing/overwriting an existing row is out of scope.
  const row = await prisma.transaction.upsert({
    where: { gmailMessageId: gmail.messageId },
    create: {
      gmailMessageId: gmail.messageId,
      gmailThreadId: gmail.threadId,
      gmailReceivedAt,
      source: "gmail",
      bank: transaction.bank,
      merchant: transaction.merchant,
      amount: transaction.amount,
      currency: transaction.currency,
      transactionKind: transaction.transactionKind,
      direction: transaction.direction,
      cardLastFour: transaction.cardLastFour,
      transactionDate: new Date(transaction.date),
      categoryId: matchedCategoryId,
      categorySource: matchedCategoryId ? "rule" : null,
    },
    update: {},
  });

  return toPersistedTransaction(row);
}

export type ManualTransactionFields = {
  merchant: string;
  amount: number;
  currency: string;
  transactionKind: string;
  direction: string;
  date: string;
  accountId: string | null;
  categoryId: string | null;
  categorySource: string | null;
};

// The manual-entry path -- always a plain create (no natural dedupe key to
// upsert against, unlike Gmail import), source: "manual", no gmail
// metadata or bank/cardLastFour at all (display prefers the linked
// Account's name instead -- see formatAccountLabel() in transactions.ts).
// Category always comes from the caller's explicit choice (including
// deliberately "Uncategorized"), never auto-matched -- the user is looking
// at a dropdown right there, so silently overriding it with a merchant
// rule would be surprising.
export async function createManualTransaction(
  fields: ManualTransactionFields,
): Promise<PersistedTransaction> {
  const row = await prisma.transaction.create({
    data: {
      source: "manual",
      bank: null,
      merchant: fields.merchant,
      amount: fields.amount,
      currency: fields.currency,
      transactionKind: fields.transactionKind,
      direction: fields.direction,
      cardLastFour: null,
      transactionDate: new Date(fields.date),
      accountId: fields.accountId,
      categoryId: fields.categoryId,
      categorySource: fields.categorySource,
    },
  });

  return toPersistedTransaction(row);
}
