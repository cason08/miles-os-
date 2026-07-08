import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";

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
        <p className="mb-1 text-zinc-700 dark:text-zinc-300">
          Welcome back, {session?.user?.name ?? session?.user?.email}
        </p>
        <p className="mb-6 text-sm text-green-700 dark:text-green-400">
          Authentication successful
        </p>
        <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
          Next milestone: Connect Gmail
        </p>
        <SignOutButton />
      </main>
    </div>
  );
}
