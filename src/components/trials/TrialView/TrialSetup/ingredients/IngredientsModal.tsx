import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IngredientRow } from "@/components/trials/TrialView/TrialSetup/ingredients/modal/IngredientRow";
import { AddIngredientRow } from "@/components/trials/TrialView/TrialSetup/ingredients/modal/AddIngredientRow";
import { IngredientsPieChart } from "@/components/trials/TrialView/TrialSetup/ingredients/shared/IngredientsPieChart";
import { useIngredients, useCreateIngredient } from "@/hooks/useIngredients";
import { useSaveTrialIngredients } from "@/hooks/useTrialIngredients";
import type { TrialIngredient, Ingredient } from "@/types/ingredient";

/** Local editing state for the modal */
interface EditableIngredient {
  ingredientId: string;
  ingredientName: string;
  percentage: number;
  pinned?: boolean;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trialId: string;
  ingredients: TrialIngredient[];
}

export const IngredientsModal = ({
  open,
  onOpenChange,
  trialId,
  ingredients: originalIngredients,
}: Props) => {
  const [editList, setEditList] = useState<EditableIngredient[]>(
    originalIngredients.map((ti) => ({
      ingredientId: ti.ingredient.id,
      ingredientName: ti.ingredient.name,
      percentage: ti.percentage,
      pinned: ti.pinned,
    })),
  );
  const [pendingIngredient, setPendingIngredient] = useState("");
  const [showPendingError, setShowPendingError] = useState(false);

  const { data: allIngredients = [] } = useIngredients();
  const createIngredient = useCreateIngredient();
  const { save, isPending } = useSaveTrialIngredients(trialId);

  const updateRow = (
    oldIngredientId: string,
    newIngredientId: string,
    ingredientName: string,
    percentage: number,
  ) => {
    setEditList((list) =>
      list.map((item) =>
        item.ingredientId === oldIngredientId
          ? { ...item, ingredientId: newIngredientId, ingredientName, percentage }
          : item,
      ),
    );
  };

  const removeRow = (ingredientId: string) => {
    setEditList((list) =>
      list.filter((item) => item.ingredientId !== ingredientId),
    );
  };

  const addRow = async (ingredientName: string, percentage: number) => {
    if (!ingredientName.trim()) return;

    // Find existing ingredient or create a new one
    let ingredient: Ingredient | undefined = allIngredients.find(
      (i) => i.name.toLowerCase() === ingredientName.trim().toLowerCase(),
    );

    if (!ingredient) {
      ingredient = await createIngredient.mutateAsync({ name: ingredientName.trim() });
    }

    // Prevent adding the same ingredient twice
    if (editList.some((item) => item.ingredientId === ingredient.id)) return;

    setEditList((list) => [
      ...list,
      {
        ingredientId: ingredient.id,
        ingredientName: ingredient.name,
        percentage,
      },
    ]);
    setShowPendingError(false);
  };

  const total = editList.reduce((sum, item) => sum + item.percentage, 0);
  const roundedTotal = Math.round(total * 10) / 10;
  const exceeds100 = roundedTotal > 100;

  /** Convert edit list to TrialIngredient[] for the pie chart preview */
  const previewIngredients: TrialIngredient[] = editList.map((item) => ({
    ingredient: { id: item.ingredientId, name: item.ingredientName },
    percentage: item.percentage,
    pinned: item.pinned,
  }));

  const handleSave = async () => {
    if (exceeds100) return;
    if (pendingIngredient.trim()) {
      setShowPendingError(true);
      return;
    }

    await save(
      originalIngredients,
      editList.map((item) => ({
        ingredientId: item.ingredientId,
        percentage: item.percentage,
        pinned: item.pinned,
      })),
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl h-155 flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-5 border-b border-border shrink-0">
          <DialogTitle>Ingredients</DialogTitle>
          <DialogDescription>
            Add or edit the ingredients for this trial.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Left: ingredient list */}
          <div className="flex-1 flex flex-col border-r border-border/40">
            {/* Scrollable ingredient rows */}
            <div className="flex-1 px-6 py-6 overflow-y-auto">
              <div className="rounded-xl bg-muted/30 ring-1 ring-border/40 p-3">
                {/* Column headers */}
                <div className="grid grid-cols-[1fr_5rem_2.5rem] gap-3 px-1 pb-2 mb-2 border-b border-border/30">
                  <span className="text-xs font-medium text-muted-foreground">
                    Name
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    %
                  </span>
                  <span />
                </div>

                <div className="flex flex-col gap-2">
                  {editList.length === 0 ? (
                    <p className="text-sm text-muted-foreground/50 py-2 px-1">
                      No ingredients yet
                    </p>
                  ) : (
                    editList.map((item) => (
                      <IngredientRow
                        key={item.ingredientId}
                        ingredientId={item.ingredientId}
                        ingredientName={item.ingredientName}
                        percentage={item.percentage}
                        onChange={(newId, name, pct) =>
                          updateRow(item.ingredientId, newId, name, pct)
                        }
                        onRemove={() => removeRow(item.ingredientId)}
                        ingredients={allIngredients}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Add ingredient — pinned at bottom */}
            <div className="shrink-0 px-6 py-4 border-t border-border/40 bg-background">
              {showPendingError && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
                  You have an unsubmitted ingredient — press{" "}
                  <span className="font-semibold">Add</span> to add it first.
                </p>
              )}
              <AddIngredientRow
                onAdd={addRow}
                onPendingChange={(val) => {
                  setPendingIngredient(val);
                  if (!val.trim()) setShowPendingError(false);
                }}
                ingredients={allIngredients}
              />
            </div>
          </div>

          {/* Right: pie chart */}
          <div className="flex-1 px-6 py-6 flex flex-col items-center justify-center overflow-hidden">
            {previewIngredients.length > 0 ? (
              <IngredientsPieChart ingredients={previewIngredients} />
            ) : (
              <p className="text-sm text-muted-foreground/50 text-center">
                Add ingredients to see the chart
              </p>
            )}
          </div>
        </div>

        <div className="border-t border-border shrink-0 px-6 py-4 flex flex-col gap-3">
          {exceeds100 && (
            <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              Ingredients total {roundedTotal}% — must not exceed 100% to save.
            </p>
          )}
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={handleSave}
              disabled={isPending || exceeds100}
            >
              {isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
