import { z } from "zod";

// Pure constants/types only -- deliberately no Prisma import here, so
// client components can pull these in without dragging the Prisma/pg
// client into the browser bundle. Data-access functions live in
// src/lib/commitments.ts, which imports from this file.

// Extending later (e.g. "cpf"-adjacent commitment types) is a one-line
// addition here -- no migration, since `type` is a plain string column.
export const CommitmentType = z.enum([
  "insurance",
  "loan",
  "installment",
  "utility",
  "mobile_plan",
  "streaming",
  "software",
  "mortgage",
]);

export const COMMITMENT_TYPE_LABELS: Record<string, string> = {
  insurance: "Insurance",
  loan: "Loan",
  installment: "Installment",
  utility: "Utility",
  mobile_plan: "Mobile Plan",
  streaming: "Streaming",
  software: "Software",
  mortgage: "Mortgage",
};

export type CommitmentStatus = "paid" | "pending" | "overdue";

export type CommitmentWithStatus = {
  id: string;
  name: string;
  type: string;
  expectedAmount: number;
  currency: string;
  expectedDayOfMonth: number;
  dayTolerance: number;
  accountId: string;
  accountName: string;
  status: CommitmentStatus;
  matchedTransaction?: { merchant: string | null; amount: number; date: string };
};

export type CommitmentInput = {
  name: string;
  type: string;
  expectedAmount: number;
  currency: string;
  expectedDayOfMonth: number;
  dayTolerance: number;
  accountId: string;
};
