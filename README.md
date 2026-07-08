# MilesOS

A personal financial operating system. See [PRODUCT.md](./PRODUCT.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [ROADMAP.md](./ROADMAP.md), [NAVIGATION.md](./NAVIGATION.md), [EXPERIENCE.md](./EXPERIENCE.md), and [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for the full planning documentation.

## Local Setup

```bash
pnpm install

# Start a local Postgres instance for development (prints a connection string)
pnpm prisma dev

# Copy the env template and fill in DATABASE_URL (from the command above)
# plus any other secrets you have.
cp .env.example .env

pnpm prisma generate
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — you should see the MilesOS health check page confirming browser → app → database → deploy are all connected.

## Stack

TypeScript, Next.js (App Router), Tailwind CSS + shadcn/ui, Prisma + PostgreSQL (Neon in production). See [ARCHITECTURE.md](./ARCHITECTURE.md) §1 for the full rationale.

## Deployment

Deployed on Vercel. See [ARCHITECTURE.md](./ARCHITECTURE.md) §6 for the background-jobs model and §10 for the development workflow.
