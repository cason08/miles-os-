import Link from "next/link";
import { auth } from "@/lib/auth";
import { ImportTransactionsButton } from "@/components/import-transactions-button";

export default async function DebugImportPage() {
  const session = await auth();

  if (!session?.gmailConnected) {
    return (
      <main style={{ fontFamily: "monospace", padding: 24 }}>
        <h1>Historical Transaction Import</h1>
        <p>Gmail isn&apos;t connected — connect it from Home first.</p>
      </main>
    );
  }

  return (
    <main style={{ fontFamily: "monospace", padding: 24 }}>
      <p>
        <Link href="/debug/gmail">← Back to Gmail messages</Link>
      </p>
      <h1>Historical Transaction Import</h1>
      <p>
        Imports every supported bank email received on or after 2026-07-01 through the full
        extraction pipeline. Emails already imported (matched by Gmail message ID) are skipped.
      </p>
      <ImportTransactionsButton />
    </main>
  );
}
