import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IngredientsTable } from "@/components/ingredients/IngredientsTable";
import {
  useIngredients,
  useCreateIngredient,
  useUpdateIngredient,
  useDeleteIngredient,
} from "@/hooks/useIngredients";
import { readTrialIngredients } from "@/api/trialIngredients";
import type {
  CreateIngredientInput,
  UpdateIngredientInput,
} from "@/api/ingredients";

export const IngredientsPage = () => {
  const { data: ingredients = [], isLoading } = useIngredients();
  const createIngredient = useCreateIngredient();
  const updateIngredient = useUpdateIngredient();
  const deleteIngredient = useDeleteIngredient();

  const [search, setSearch] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const trialCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const ti of readTrialIngredients()) {
      counts.set(ti.ingredientId, (counts.get(ti.ingredientId) ?? 0) + 1);
    }
    return counts;
  }, [ingredients]);

  const filtered = useMemo(() => {
    if (!search.trim()) return ingredients;
    const q = search.toLowerCase();
    return ingredients.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.abbreviation?.toLowerCase().includes(q) ||
        i.type?.toLowerCase().includes(q),
    );
  }, [ingredients, search]);

  const handleUpdate = (id: string, input: UpdateIngredientInput) => {
    updateIngredient.mutate({ id, ...input });
  };

  const handleDelete = (id: string) => {
    deleteIngredient.mutate(id);
  };

  const handleCreate = (input: CreateIngredientInput) => {
    createIngredient.mutate(input, { onSuccess: () => setIsAdding(false) });
  };

  return (
    <>
      {/* Header */}
      <header className="h-14 bg-card border-b border-border flex items-center px-5 gap-3 shrink-0">
        <Input
          placeholder="Search ingredients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-95 h-9 bg-muted border-0 rounded-full"
        />
        <span className="text-xs text-muted-foreground">
          {filtered.length} ingredient{filtered.length !== 1 && "s"}
        </span>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-5">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-xl font-extrabold tracking-tight">
            Ingredients
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({filtered.length})
            </span>
          </h2>
          <Button
            size="sm"
            className="rounded-full"
            onClick={() => setIsAdding(true)}
            disabled={isAdding}
          >
            <Plus size={14} className="mr-1" />
            Add Ingredient
          </Button>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (
          <IngredientsTable
            ingredients={filtered}
            trialCounts={trialCounts}
            isAdding={isAdding}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onCreate={handleCreate}
            onCancelAdd={() => setIsAdding(false)}
          />
        )}
      </main>
    </>
  );
};
