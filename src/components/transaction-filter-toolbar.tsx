"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { fieldClass } from "@/lib/ui";

const DATE_RANGE_OPTIONS = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last7", label: "Last 7 Days" },
  { value: "thisMonth", label: "This Month" },
  { value: "lastMonth", label: "Last Month" },
  { value: "thisYear", label: "This Year" },
  { value: "custom", label: "Custom Range" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "amountDesc", label: "Highest Amount" },
  { value: "amountAsc", label: "Lowest Amount" },
  { value: "merchantAsc", label: "Merchant A–Z" },
  { value: "merchantDesc", label: "Merchant Z–A" },
];

export function TransactionFilterToolbar({
  accountOptions,
  categories,
}: {
  accountOptions: { id: string; name: string }[];
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get("q") ?? "");

  function updateParam(key: string, value: string, defaultValue = "all") {
    const next = new URLSearchParams(searchParams.toString());
    if (value === defaultValue || value === "") {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    startTransition(() => {
      router.replace(`${pathname}${next.toString() ? `?${next.toString()}` : ""}`, {
        scroll: false,
      });
    });
  }

  // Debounced -- avoids a server round trip on every keystroke.
  useEffect(() => {
    const currentQ = searchParams.get("q") ?? "";
    if (search === currentQ) return;
    const handle = setTimeout(() => updateParam("q", search, ""), 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const range = searchParams.get("range") ?? "all";
  const hasActiveFilters = Array.from(searchParams.keys()).some((key) => key !== "sort");

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          className={`${fieldClass} min-w-[12rem] flex-1`}
          placeholder="Search merchant, account, category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className={fieldClass}
          value={searchParams.get("accountId") ?? "all"}
          onChange={(e) => updateParam("accountId", e.target.value)}
        >
          <option value="all">All Accounts</option>
          <option value="unassigned">Unassigned</option>
          {accountOptions.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </select>

        <select
          className={fieldClass}
          value={searchParams.get("categoryId") ?? "all"}
          onChange={(e) => updateParam("categoryId", e.target.value)}
        >
          <option value="all">All Categories</option>
          <option value="uncategorized">Uncategorized</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <select
          className={fieldClass}
          value={range}
          onChange={(e) => updateParam("range", e.target.value)}
        >
          {DATE_RANGE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          className={fieldClass}
          value={searchParams.get("type") ?? "all"}
          onChange={(e) => updateParam("type", e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>

        <select
          className={fieldClass}
          value={searchParams.get("source") ?? "all"}
          onChange={(e) => updateParam("source", e.target.value)}
        >
          <option value="all">All Sources</option>
          <option value="gmail">Imported</option>
          <option value="manual">Manual</option>
        </select>

        <select
          className={fieldClass}
          value={searchParams.get("sort") ?? "newest"}
          onChange={(e) => updateParam("sort", e.target.value, "newest")}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              startTransition(() => router.replace(pathname, { scroll: false }));
            }}
            className="text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {range === "custom" && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            className={fieldClass}
            value={searchParams.get("from") ?? ""}
            onChange={(e) => updateParam("from", e.target.value, "")}
          />
          <span className="text-xs text-muted-foreground">to</span>
          <input
            type="date"
            className={fieldClass}
            value={searchParams.get("to") ?? ""}
            onChange={(e) => updateParam("to", e.target.value, "")}
          />
        </div>
      )}
    </div>
  );
}
