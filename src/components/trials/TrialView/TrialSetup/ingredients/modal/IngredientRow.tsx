import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IngredientCombobox } from "./IngredientCombobox";

// ── Regular (controlled) row ──────────────────────────────────────

interface IngredientRowProps {
  ingredient: string;
  percentage: number;
  onChange: (ingredient: string, percentage: number) => void;
  onRemove: () => void;
  suggestions: string[];
}

export function IngredientRow({
  ingredient,
  percentage,
  onChange,
  onRemove,
  suggestions,
}: IngredientRowProps) {
  return (
    <div className="grid grid-cols-[1fr_5rem_2.5rem] gap-3 items-center">
      <IngredientCombobox
        value={ingredient}
        onChange={(val) => onChange(val, percentage)}
        suggestions={suggestions}
        placeholder="Ingredient name"
      />
      <div className="relative">
        <Input
          type="number"
          value={percentage === 0 ? "" : percentage}
          onChange={(e) =>
            onChange(
              ingredient,
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
}

// Default export kept for backward compatibility
export default IngredientRow;
