import { useState } from "react";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IngredientCombobox } from "./IngredientCombobox";
import type { Ingredient } from "@/types/ingredient";

interface AddIngredientRowProps {
  onAdd: (ingredientName: string, percentage: number) => void;
  onPendingChange: (ingredientName: string) => void;
  ingredients: Ingredient[];
}

export const AddIngredientRow = ({
  onAdd,
  onPendingChange,
  ingredients,
}: AddIngredientRowProps) => {
  const [ingredientName, setIngredientName] = useState("");
  const [pctStr, setPctStr] = useState("");

  const handleIngredientChange = (val: string) => {
    setIngredientName(val);
    onPendingChange(val);
  };

  const commit = () => {
    if (!ingredientName.trim()) return;
    const pct = Math.max(0, Math.min(100, Number(pctStr) || 0));
    onAdd(ingredientName, pct);
    setIngredientName("");
    setPctStr("");
    onPendingChange("");
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <IngredientCombobox
          value={ingredientName}
          onChange={handleIngredientChange}
          ingredients={ingredients}
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
        disabled={!ingredientName.trim()}
        onClick={commit}
      >
        <Plus size={14} />
        Add
      </Button>
    </div>
  );
};
