import { prisma } from "@/lib/db";
import type { Transaction } from "@/lib/transaction";
import { matchCategoryForMerchant } from "@/lib/merchant-rules";

export type PersistedTransaction = {
  id: string;
  gmailMessageId: string;
  gmailThreadId: string;
  gmailReceivedAt: string;
  bank: string;
  merchant: string | null;
  amount: number;
  currency: string;
  transactionKind: string;
  direction: string;
  cardLastFour: string | null;
  transactionDate: string;
  createdAt: string;
};

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

  return {
    id: row.id,
    gmailMessageId: row.gmailMessageId,
    gmailThreadId: row.gmailThreadId,
    gmailReceivedAt: row.gmailReceivedAt.toISOString(),
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
