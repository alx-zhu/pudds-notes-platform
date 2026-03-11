import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// ── Regular (controlled) row ──────────────────────────────────────

interface IngredientRowProps {
  ingredient: string;
  percentage: number;
  onChange: (ingredient: string, percentage: number) => void;
  onRemove: () => void;
}

export function IngredientRow({
  ingredient,
  percentage,
  onChange,
  onRemove,
}: IngredientRowProps) {
  return (
    <div className="grid grid-cols-[1fr_5rem_2.5rem] gap-3 items-center">
      <Input
        value={ingredient}
        onChange={(e) => onChange(e.target.value, percentage)}
        placeholder="Ingredient name"
        className="h-8 text-sm bg-muted border-0 focus-visible:ring-1"
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

// ── Add-new row (visually distinct, locally managed) ──────────────

interface AddIngredientRowProps {
  onAdd: (ingredient: string, percentage: number) => void;
}

export function AddIngredientRow({ onAdd }: AddIngredientRowProps) {
  const [ingredient, setIngredient] = useState("");
  const [pctStr, setPctStr] = useState("");

  function commit() {
    if (!ingredient.trim()) return;
    const pct = Math.max(0, Math.min(100, Number(pctStr) || 0));
    onAdd(ingredient, pct);
    setIngredient("");
    setPctStr("");
  }

  return (
    <div className="pt-2 border-t border-dashed border-border/50">
      <div className="grid grid-cols-[1fr_5rem_2.5rem] gap-3 items-center">
        <Input
          value={ingredient}
          onChange={(e) => setIngredient(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && commit()}
          placeholder="+ Add ingredient"
          className="h-8 text-sm bg-muted border-0 focus-visible:ring-1 placeholder:italic placeholder:text-muted-foreground/60"
        />
        <div className="relative">
          <Input
            type="number"
            value={pctStr}
            onChange={(e) => {
              const raw = e.target.value;
              // Allow empty string or valid number in range
              if (raw === "" || (Number(raw) >= 0 && Number(raw) <= 100)) {
                setPctStr(raw);
              }
            }}
            onKeyDown={(e) => e.key === "Enter" && commit()}
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
          variant="default"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          disabled={!ingredient.trim()}
          onClick={commit}
        >
          <Plus size={14} />
        </Button>
      </div>
    </div>
  );
}

// Default export kept for backward compatibility
export default IngredientRow;
