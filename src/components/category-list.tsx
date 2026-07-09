"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CategoryForm } from "@/components/category-form";
import { CategoryRow } from "@/components/category-row";
import type { CategoryData } from "@/lib/categories";

export function CategoryList({ categories }: { categories: CategoryData[] }) {
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {categories.length} categor{categories.length === 1 ? "y" : "ies"}
        </span>
        {!creating && (
          <Button type="button" size="sm" onClick={() => setCreating(true)}>
            + New Category
          </Button>
        )}
      </div>

      {creating && (
        <Card>
          <CategoryForm onDone={() => setCreating(false)} onCancel={() => setCreating(false)} />
        </Card>
      )}

      {categories.length === 0 && !creating ? (
        <Card>
          <p className="text-sm text-muted-foreground">
            No categories yet. Add one (e.g. Dining, Groceries, Transport) with a monthly budget
            to start tracking spend against it.
          </p>
        </Card>
      ) : (
        categories.length > 0 && (
          <Card className="gap-0 divide-y divide-border p-0">
            {categories.map((category) =>
              editingId === category.id ? (
                <div key={category.id} className="p-4">
                  <CategoryForm
                    initial={category}
                    onDone={() => setEditingId(null)}
                    onCancel={() => setEditingId(null)}
                  />
                </div>
              ) : (
                <CategoryRow
                  key={category.id}
                  category={category}
                  onEdit={() => setEditingId(category.id)}
                />
              ),
            )}
          </Card>
        )
      )}
    </div>
  );
}
