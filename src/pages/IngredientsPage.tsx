import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IngredientsTable } from "@/components/ingredients/IngredientsTable";
import { IngredientControls } from "@/components/ingredients/IngredientControls";
import {
  useIngredients,
  useCreateIngredient,
  useUpdateIngredient,
  useDeleteIngredient,
} from "@/hooks/useIngredients";
import { useTrials } from "@/hooks/useTrials";
import { readTrialIngredients } from "@/api/trialIngredients";
import { getMostRecentEval } from "@/lib/trialDisplay";
import {
  EMPTY_INGREDIENT_FILTERS,
  DEFAULT_INGREDIENT_SORT,
} from "@/types/ingredientFilters";
import type {
  IngredientFilters,
  IngredientSort,
} from "@/types/ingredientFilters";
import type {
  CreateIngredientInput,
  UpdateIngredientInput,
} from "@/api/ingredients";

export const IngredientsPage = () => {
  const { data: ingredients = [], isLoading } = useIngredients();
  const { data: trials = [] } = useTrials();
  const createIngredient = useCreateIngredient();
  const updateIngredient = useUpdateIngredient();
  const deleteIngredient = useDeleteIngredient();

  const [search, setSearch] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [filters, setFilters] = useState<IngredientFilters>(EMPTY_INGREDIENT_FILTERS);
  const [sort, setSort] = useState<IngredientSort>(DEFAULT_INGREDIENT_SORT);

  const trialCounts = useMemo(() => {
    const ids = new Set(ingredients.map((i) => i.id));
    const counts = new Map<string, number>();
    for (const ti of readTrialIngredients()) {
      if (ids.has(ti.ingredientId)) {
        counts.set(ti.ingredientId, (counts.get(ti.ingredientId) ?? 0) + 1);
      }
    }
    return counts;
  }, [ingredients]);

  const avgScores = useMemo(() => {
    const sums = new Map<string, { total: number; count: number }>();
    for (const trial of trials) {
      const evalResult = getMostRecentEval(trial);
      if (evalResult?.scores.overall == null) continue;
      for (const ti of trial.ingredients) {
        const id = ti.ingredient.id;
        const prev = sums.get(id) ?? { total: 0, count: 0 };
        sums.set(id, {
          total: prev.total + evalResult.scores.overall,
          count: prev.count + 1,
        });
      }
    }
    const result = new Map<string, number>();
    for (const [id, { total, count }] of sums) {
      result.set(id, total / count);
    }
    return result;
  }, [trials]);

  const displayed = useMemo(() => {
    let result = [...ingredients];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.abbreviation?.toLowerCase().includes(q) ||
          i.type?.toLowerCase().includes(q),
      );
    }

    if (filters.type !== null) {
      result = result.filter((i) => i.type === filters.type);
    }

    if (filters.solid !== null) {
      result = result.filter((i) => (i.solid ?? false) === filters.solid);
    }

    result.sort((a, b) => {
      const dir = sort.dir === "asc" ? 1 : -1;
      switch (sort.field) {
        case "name":
          return a.name.localeCompare(b.name) * dir;
        case "cost":
          return ((a.cost ?? -Infinity) - (b.cost ?? -Infinity)) * dir;
        case "avgScore":
          return (
            ((avgScores.get(a.id) ?? -Infinity) -
              (avgScores.get(b.id) ?? -Infinity)) *
            dir
          );
        case "trials":
          return (
            ((trialCounts.get(a.id) ?? 0) - (trialCounts.get(b.id) ?? 0)) * dir
          );
      }
    });

    return result;
  }, [ingredients, search, filters, sort, avgScores, trialCounts]);

  const handleUpdate = (id: string, input: UpdateIngredientInput) =>
    updateIngredient.mutate({ id, ...input });

  const handleDelete = (id: string) => deleteIngredient.mutate(id);

  const handleCreate = (input: CreateIngredientInput) =>
    createIngredient.mutate(input, { onSuccess: () => setIsAdding(false) });

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
        <span className="text-xs text-muted-foreground ml-auto">
          {displayed.length} ingredient{displayed.length !== 1 && "s"}
        </span>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-5">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <h2 className="text-xl font-extrabold tracking-tight shrink-0">
            Ingredients
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({displayed.length})
            </span>
          </h2>
          <IngredientControls
            filters={filters}
            onFiltersChange={setFilters}
            sort={sort}
            onSortChange={setSort}
          />
          <Button
            size="sm"
            className="rounded-full ml-auto"
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
            ingredients={displayed}
            trialCounts={trialCounts}
            avgScores={avgScores}
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
