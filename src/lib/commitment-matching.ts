import type { Account, MonthlyCommitment, Transaction } from "@/generated/prisma/client";

type CommitmentWithAccount = MonthlyCommitment & { account: Account };

// Each rule is an independent, appendable predicate -- adding a future rule
// (MCC/category, an exact-merchant-mapping table, a card-specific rule) is a
// new function appended to MATCH_RULES, never a change to this signature or
// to isMatch() itself. A future merchant-alias table would back a new rule
// here without touching MonthlyCommitment's schema at all.
type MatchRule = (commitment: CommitmentWithAccount, transaction: Transaction) => boolean;

function lastDayOfMonth(year: number, monthIndex: number): number {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

// Clamps expectedDayOfMonth to the target month's real length (e.g. day 31
// in February) before applying the ± tolerance window. Built via Date.UTC,
// not `new Date(y, m, d)` -- transaction.transactionDate (compared against
// this window in dateWindowRule below) always comes back from Prisma as
// exact UTC midnight for its calendar date (it's a bare @db.Date column,
// no time-of-day). A locally-constructed `end` boundary is a local
// midnight instant, which on a server east of UTC (this one runs in
// Asia/Singapore, UTC+8) lands 8 hours before the real UTC midnight of
// that same calendar day -- silently excluding a transaction dated
// exactly on the window's last valid day.
function expectedDateWindow(
  commitment: CommitmentWithAccount,
  year: number,
  monthIndex: number,
): { start: Date; end: Date } {
  const day = Math.min(commitment.expectedDayOfMonth, lastDayOfMonth(year, monthIndex));
  const expected = new Date(Date.UTC(year, monthIndex, day));
  const start = new Date(expected);
  start.setUTCDate(start.getUTCDate() - commitment.dayTolerance);
  const end = new Date(expected);
  end.setUTCDate(end.getUTCDate() + commitment.dayTolerance);
  return { start, end };
}

const dateWindowRule: MatchRule = (commitment, transaction) => {
  const { start, end } = expectedDateWindow(
    commitment,
    transaction.transactionDate.getFullYear(),
    transaction.transactionDate.getMonth(),
  );
  return transaction.transactionDate >= start && transaction.transactionDate <= end;
};

// Generous band (±20%) since utilities/mobile plans genuinely vary month to
// month -- expectedAmount is a typical amount, not an exact requirement.
const AMOUNT_TOLERANCE_RATIO = 0.2;

const amountToleranceRule: MatchRule = (commitment, transaction) => {
  const expected = commitment.expectedAmount.toNumber();
  const actual = transaction.amount.toNumber();
  return Math.abs(actual - expected) <= expected * AMOUNT_TOLERANCE_RATIO;
};

const merchantSubstringRule: MatchRule = (commitment, transaction) => {
  if (!transaction.merchant) return false;
  const name = commitment.name.toLowerCase();
  const merchant = transaction.merchant.toLowerCase();
  return merchant.includes(name) || name.includes(merchant);
};

// A strengthening signal, never a hard requirement -- passes automatically
// when either side has no card digits to compare (e.g. a cash-account
// commitment, or a transaction with no card info).
const cardLastFourRule: MatchRule = (commitment, transaction) => {
  if (!commitment.account.cardLastFour || !transaction.cardLastFour) return true;
  return commitment.account.cardLastFour === transaction.cardLastFour;
};

const MATCH_RULES: MatchRule[] = [
  dateWindowRule,
  amountToleranceRule,
  merchantSubstringRule,
  cardLastFourRule,
];

export function isMatch(commitment: CommitmentWithAccount, transaction: Transaction): boolean {
  return MATCH_RULES.every((rule) => rule(commitment, transaction));
}

export function isPastDueWindow(commitment: CommitmentWithAccount, today: Date): boolean {
  const { end } = expectedDateWindow(commitment, today.getFullYear(), today.getMonth());
  return today > end;
}
