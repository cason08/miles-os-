import { prisma } from "@/lib/db";

type CheckStatus = "ok" | "error";

async function checkDatabase(): Promise<{ status: CheckStatus; detail: string }> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: "ok", detail: "Connected" };
  } catch (error) {
    return {
      status: "error",
      detail: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

function getDeployInfo(): { status: CheckStatus; detail: string } {
  const commit = process.env.VERCEL_GIT_COMMIT_SHA;
  const env = process.env.VERCEL_ENV;
  if (env) {
    return { status: "ok", detail: `${env}${commit ? ` @ ${commit.slice(0, 7)}` : ""}` };
  }
  return { status: "ok", detail: "Local development (not deployed yet)" };
}

function StatusRow({
  label,
  status,
  detail,
}: {
  label: string;
  status: CheckStatus;
  detail: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-200 py-3 dark:border-zinc-800">
      <span className="font-medium text-zinc-900 dark:text-zinc-100">{label}</span>
      <span
        className={
          status === "ok"
            ? "text-sm text-green-700 dark:text-green-400"
            : "text-sm text-red-700 dark:text-red-400"
        }
      >
        {status === "ok" ? "✓" : "✕"} {detail}
      </span>
    </div>
  );
}

export default async function HealthCheckPage() {
  const database = await checkDatabase();
  const deploy = getDeployInfo();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="mb-1 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          MilesOS Health Check
        </h1>
        <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
          Confirms browser → app → database → deploy are all connected.
        </p>
        <StatusRow label="Browser" status="ok" detail="Rendered" />
        <StatusRow label="App (Next.js)" status="ok" detail="Serving" />
        <StatusRow label="Database" status={database.status} detail={database.detail} />
        <StatusRow label="Deploy" status={deploy.status} detail={deploy.detail} />
      </main>
    </div>
  );
}
