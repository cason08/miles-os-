import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="mb-4 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          MilesOS
        </h1>
        <p className="mb-1 text-zinc-700 dark:text-zinc-300">
          Welcome back, {session?.user?.name}
        </p>
        <p className="mb-6 text-sm text-green-700 dark:text-green-400">
          Authentication successful
        </p>
        <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
          Next milestone: Connect Gmail
        </p>
        <form
          action={async () => {
            "use server";
            await signOut();
          }}
        >
          <Button type="submit" variant="outline">
            Sign out
          </Button>
        </form>
      </main>
    </div>
  );
}
