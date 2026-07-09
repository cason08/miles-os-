import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// KNOWN ISSUE (local dev only): as of this writing, pg.Pool -- which this
// adapter uses internally -- fails with ECONNREFUSED against the local
// `prisma dev` emulator (a lightweight embedded Postgres, not a full
// server), even though a plain pg.Client succeeds against the identical
// DATABASE_URL. Confirmed via a minimal repro with no app code involved:
// `new pg.Pool({ connectionString }).query(...)` fails; `new
// pg.Client({ connectionString }).query(...)` succeeds. `prisma migrate
// dev` also fails separately (P1017, at its shadow-database-diffing step;
// `prisma db push` works around that one). Not something to debug further
// here -- expected to resolve once DATABASE_URL points at a real Postgres
// instance instead of the local emulator.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
