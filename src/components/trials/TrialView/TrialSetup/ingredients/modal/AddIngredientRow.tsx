import { useState } from "react";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IngredientCombobox } from "./IngredientCombobox";

interface AddIngredientRowProps {
  onAdd: (ingredient: string, percentage: number) => void;
  onPendingChange: (ingredient: string) => void;
  suggestions: string[];
}

export function AddIngredientRow({
  onAdd,
  onPendingChange,
  suggestions,
}: AddIngredientRowProps) {
  const [ingredient, setIngredient] = useState("");
  const [pctStr, setPctStr] = useState("");

  function handleIngredientChange(val: string) {
    setIngredient(val);
    onPendingChange(val);
  }

  function commit() {
    if (!ingredient.trim()) return;
    const pct = Math.max(0, Math.min(100, Number(pctStr) || 0));
    onAdd(ingredient, pct);
    setIngredient("");
    setPctStr("");
    onPendingChange("");
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <IngredientCombobox
          value={ingredient}
          onChange={handleIngredientChange}
          suggestions={suggestions}
          placeholder="Add ingredient..."
        />
      </div>
      <div className="relative w-20">
        <Input
          type="number"
          value={pctStr}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === "" || (Number(raw) >= 0 && Number(raw) <= 100)) {
              setPctStr(raw);
            }
          }}
          onKeyDown={(e) => e.key === "Enter" && commit()}
          placeholder="%"
          min={0}
          max={100}
          step={0.1}
          className="h-8 text-sm pr-6"
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
          %
        </span>
      </div>
      <Button
        type="button"
        size="sm"
        className="h-8 gap-1.5 shrink-0"
        disabled={!ingredient.trim()}
        onClick={commit}
      >
        <Plus size={14} />
        Add
      </Button>
    </div>
  );
}
