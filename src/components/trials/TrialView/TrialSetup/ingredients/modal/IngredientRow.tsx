import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IngredientCombobox } from "./IngredientCombobox";
import type { Ingredient } from "@/types/ingredient";

// ── Regular (controlled) row ──────────────────────────────────────

interface IngredientRowProps {
  ingredientId: string;
  ingredientName: string;
  percentage: number;
  onChange: (ingredientId: string, ingredientName: string, percentage: number) => void;
  onRemove: () => void;
  ingredients: Ingredient[];
}

export const IngredientRow = ({
  ingredientId,
  ingredientName,
  percentage,
  onChange,
  onRemove,
  ingredients,
}: IngredientRowProps) => {
  const resolveIngredient = (name: string): { id: string; name: string } => {
    const match = ingredients.find(
      (i) => i.name.toLowerCase() === name.trim().toLowerCase(),
    );
    return match ? { id: match.id, name: match.name } : { id: ingredientId, name };
  };

  return (
    <div className="grid grid-cols-[1fr_5rem_2.5rem] gap-3 items-center">
      <IngredientCombobox
        value={ingredientName}
        onChange={(val) => {
          const resolved = resolveIngredient(val);
          onChange(resolved.id, resolved.name, percentage);
        }}
        ingredients={ingredients}
        placeholder="Ingredient name"
      />
      <div className="relative">
        <Input
          type="number"
          value={percentage === 0 ? "" : percentage}
          onChange={(e) =>
            onChange(
              ingredientId,
              ingredientName,
              Math.max(0, Math.min(100, Number(e.target.value) || 0)),
            )
          }
          placeholder="0"
          min={0}
          max={100}
          step={0.1}
          className="h-8 text-sm bg-muted border-0 focus-visible:ring-1 pr-6"
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
          %
        </span>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-foreground"
        onClick={onRemove}
      >
        <X size={14} />
      </Button>
    </div>
  );
};
