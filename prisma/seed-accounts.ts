// One-off seed for the known set of real accounts. Not wired into
// `pnpm dev` or migrations -- run once via `npx tsx prisma/seed-accounts.ts`.
// Balances are seeded at 0 as an explicit placeholder; correct each to its
// real current balance via the /accounts page immediately after seeding.
import { prisma } from "../src/lib/db";

const ACCOUNTS = [
  {
    name: "OCBC Current Account",
    type: "cash",
    includedInAvailableCash: true,
    includedInNetWorth: true,
  },
  {
    name: "Mari Invest SavePlus",
    type: "cash_equivalent",
    includedInAvailableCash: true,
    includedInNetWorth: true,
  },
  {
    name: "Mari Invest Income",
    type: "investment",
    includedInAvailableCash: false,
    includedInNetWorth: true,
  },
  {
    name: "DBS Altitude",
    type: "credit_card",
    includedInAvailableCash: false,
    includedInNetWorth: false,
  },
  {
    name: "DBS Woman's World Mastercard (WWMC)",
    type: "credit_card",
    includedInAvailableCash: false,
    includedInNetWorth: false,
  },
  {
    name: "UOB Preferred Platinum Visa (PPV)",
    type: "credit_card",
    includedInAvailableCash: false,
    includedInNetWorth: false,
  },
  {
    name: "Citibank Rewards",
    type: "credit_card",
    includedInAvailableCash: false,
    includedInNetWorth: false,
  },
];

async function main() {
  for (const account of ACCOUNTS) {
    const existing = await prisma.account.findFirst({ where: { name: account.name } });
    if (existing) {
      console.log(`Skipping "${account.name}" -- already exists.`);
      continue;
    }
    const created = await prisma.account.create({
      data: {
        ...account,
        currentBalance: 0,
        currency: "SGD",
      },
    });
    console.log(`Created "${created.name}" (${created.id})`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
