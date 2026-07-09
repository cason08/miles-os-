import { prisma } from "@/lib/db";
import { getAvailableCash } from "@/lib/accounts";
import { isMatch, isPastDueWindow } from "@/lib/commitment-matching";
import type { CommitmentStatus, CommitmentWithStatus, CommitmentInput } from "@/lib/commitment-types";

export type { CommitmentStatus, CommitmentWithStatus, CommitmentInput } from "@/lib/commitment-types";
export { CommitmentType, COMMITMENT_TYPE_LABELS } from "@/lib/commitment-types";

// Live derivation, no persisted per-period state (see plan doc for why this
// is safe to defer): status is recomputed from Transaction on every read,
// the same way getAvailableCash()/getNetWorth() recompute from Account.
export async function getCommitmentsWithStatus(): Promise<CommitmentWithStatus[]> {
  const commitments = await prisma.monthlyCommitment.findMany({
    include: { account: true },
    orderBy: { name: "asc" },
  });

  if (commitments.length === 0) return [];

  const today = new Date();
  // Wide-enough net to catch any commitment's window (dayTolerance can push
  // a window into the adjacent month) -- isMatch() re-checks the precise
  // per-commitment window itself, so this is only a performance pre-filter.
  const rangeStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const rangeEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const candidateTransactions = await prisma.transaction.findMany({
    where: { direction: "out", transactionDate: { gte: rangeStart, lte: rangeEnd } },
  });

  return commitments.map((commitment) => {
    const matched = candidateTransactions.find((transaction) =>
      isMatch(commitment, transaction),
    );

    const status: CommitmentStatus = matched
      ? "paid"
      : isPastDueWindow(commitment, today)
        ? "overdue"
        : "pending";

    return {
      id: commitment.id,
      name: commitment.name,
      type: commitment.type,
      expectedAmount: commitment.expectedAmount.toNumber(),
      currency: commitment.currency,
      expectedDayOfMonth: commitment.expectedDayOfMonth,
      dayTolerance: commitment.dayTolerance,
      accountId: commitment.accountId,
      accountName: commitment.account.name,
      status,
      ...(matched
        ? {
            matchedTransaction: {
              merchant: matched.merchant,
              amount: matched.amount.toNumber(),
              date: matched.transactionDate.toISOString().slice(0, 10),
            },
          }
        : {}),
    };
  });
}

export async function getRemainingMonthlyCommitments(): Promise<number> {
  const commitments = await getCommitmentsWithStatus();
  return commitments
    .filter((commitment) => commitment.status !== "paid")
    .reduce((sum, commitment) => sum + commitment.expectedAmount, 0);
}

export async function getProjectedAvailableCash(): Promise<number> {
  const [availableCash, remaining] = await Promise.all([
    getAvailableCash(),
    getRemainingMonthlyCommitments(),
  ]);
  return availableCash - remaining;
}

export async function createCommitment(input: CommitmentInput): Promise<void> {
  await prisma.monthlyCommitment.create({ data: input });
}

export async function updateCommitment(id: string, input: CommitmentInput): Promise<void> {
  await prisma.monthlyCommitment.update({ where: { id }, data: input });
}

export async function deleteCommitment(id: string): Promise<void> {
  await prisma.monthlyCommitment.delete({ where: { id } });
}
