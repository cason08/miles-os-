import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getCategories } from "@/lib/categories";
import { CategoryList } from "@/components/category-list";

export default async function CategoriesPage() {
  const session = await auth();

  // Defense in depth -- same pattern as src/app/page.tsx / src/app/accounts/page.tsx.
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  const categories = await getCategories();

  return (
    <div className="flex min-h-screen flex-col">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-8 sm:py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
          <Link href="/" className="text-sm text-muted-foreground hover:underline">
            ← Back to Home
          </Link>
        </div>

        <CategoryList categories={categories} />
      </main>
    </div>
  );
}
