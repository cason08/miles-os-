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
        {!session.gmailConnected && (
          <div className="mb-6 rounded-md border border-amber-300 bg-amber-50 p-4 text-left dark:border-amber-900 dark:bg-amber-950">
            <p className="mb-3 text-sm text-amber-800 dark:text-amber-300">
              Gmail isn&apos;t connected. Connect it to enable automatic transaction import.
            </p>
            <ConnectGmailButton />
          </div>
        )}
        <SignOutButton />
      </main>
    </div>
  );
}
