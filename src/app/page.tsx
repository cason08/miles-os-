import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";
import { ConnectGmailButton } from "@/components/connect-gmail-button";

export default async function HomePage() {
  const session = await auth();

  // Defense in depth: this page must never render authenticated content
  // without a real session, regardless of whether src/proxy.ts ran or
  // behaved correctly upstream. `session.user` is only present on an
  // actual signed-in session, never on an error-shaped auth() result.
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="mb-4 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          MilesOS
        </h1>
        <p className="mb-6 text-zinc-700 dark:text-zinc-300">
          Welcome back, {session.user.name ?? session.user.email}
        </p>
        <div className="mb-6 space-y-1 text-sm">
          <p className="text-green-700 dark:text-green-400">Google ✓ Connected</p>
          {session.gmailConnected ? (
            <p className="text-green-700 dark:text-green-400">Gmail ✓ Connected</p>
          ) : (
            <p className="text-zinc-500 dark:text-zinc-400">Gmail not connected</p>
          )}
        </div>
        {!session.gmailConnected && (
          <div className="mb-6">
            <ConnectGmailButton />
          </div>
        )}
        <SignOutButton />
      </main>
    </div>
  );
}
