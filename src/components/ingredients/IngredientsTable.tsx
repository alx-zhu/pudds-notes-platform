import { useState } from "react";
import { Pin, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { InlineInput } from "@/components/shared/InlineInput";
import { IngredientTypeSelect } from "@/components/ingredients/IngredientTypeSelect";
import type { IngredientType } from "@/config/ingredient.config";
import type { Ingredient } from "@/types/ingredient";
import type {
  CreateIngredientInput,
  UpdateIngredientInput,
} from "@/api/ingredients";

/* ── Column sizing ───────────────────────────────────────────────── */

const COL = {
  pin: "w-12",
  abbreviation: "w-28",
  type: "w-40",
  solid: "w-16",
  cost: "w-28",
  trials: "w-18",
  actions: "w-12",
} as const;

const TH =
  "px-4 py-2.5 font-medium text-xs text-muted-foreground uppercase tracking-wide whitespace-nowrap";

/* ── Table ───────────────────────────────────────────────────────── */

interface Props {
  ingredients: Ingredient[];
  trialCounts: Map<string, number>;
  isAdding: boolean;
  onUpdate: (id: string, input: UpdateIngredientInput) => void;
  onDelete: (id: string) => void;
  onCreate: (input: CreateIngredientInput) => void;
  onCancelAdd: () => void;
}

export const IngredientsTable = ({
  ingredients,
  trialCounts,
  isAdding,
  onUpdate,
  onDelete,
  onCreate,
  onCancelAdd,
}: Props) => {
  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <table className="w-full text-sm table-fixed">
        <thead>
          <tr className="bg-muted">
            <th className={COL.pin} />
            <th className={`${TH} text-left`}>Ingredient</th>
            <th className={`${TH} text-left ${COL.abbreviation}`}>
              Abbreviation
            </th>
            <th className={`${TH} text-left ${COL.type}`}>Type</th>
            <th className={`${TH} text-center ${COL.solid}`}>Solid</th>
            <th className={`${TH} text-left ${COL.cost}`}>Cost / lb</th>
            <th className={`${TH} text-right ${COL.trials}`}>Trials</th>
            <th className={COL.actions} />
          </tr>
        </thead>
        <tbody>
          {isAdding && (
            <NewIngredientRow onCreate={onCreate} onCancel={onCancelAdd} />
          )}
          {ingredients.length === 0 && !isAdding ? (
            <tr>
              <td
                colSpan={8}
                className="text-center py-12 text-muted-foreground text-sm"
              >
                No ingredients yet. Click "Add Ingredient" to create one.
              </td>
            </tr>
          ) : (
            ingredients.map((ing) => (
              <IngredientRow
                key={ing.id}
                ingredient={ing}
                trialCount={trialCounts.get(ing.id) ?? 0}
                onUpdate={onUpdate}
                onDelete={onDelete}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

/* ── New ingredient row ──────────────────────────────────────────── */

interface NewRowProps {
  onCreate: (input: CreateIngredientInput) => void;
  onCancel: () => void;
}

const NewIngredientRow = ({ onCreate, onCancel }: NewRowProps) => {
  const [name, setName] = useState("");
  const [abbreviation, setAbbreviation] = useState("");
  const [type, setType] = useState<IngredientType | undefined>();
  const [solid, setSolid] = useState(false);
  const [costRaw, setCostRaw] = useState("");
  const [pinned, setPinned] = useState(false);

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const cost = parseFloat(costRaw.replace(/[$,]/g, ""));
    onCreate({
      name: trimmed,
      abbreviation: abbreviation.trim() || undefined,
      pinned: pinned || undefined,
      type: type,
      solid: solid || undefined,
      costPerLb: !isNaN(cost) ? cost : undefined,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <tr className="border-b border-border bg-primary/5">
      {/* Pin */}
      <td className="px-2 py-2.5 text-center">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setPinned(!pinned)}
        >
          <Pin
            size={14}
            className={
              pinned
                ? "fill-amber-400 text-amber-500"
                : "text-muted-foreground"
            }
          />
        </Button>
      </td>

      {/* Name */}
      <td className="px-4 py-2.5">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ingredient name..."
          className="h-7 text-sm bg-transparent"
          autoFocus
        />
      </td>

      {/* Abbreviation */}
      <td className="px-4 py-2.5">
        <Input
          value={abbreviation}
          onChange={(e) => setAbbreviation(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="—"
          className="h-7 text-xs font-mono bg-transparent"
        />
      </td>

      {/* Type */}
      <td className="px-4 py-2.5">
        <IngredientTypeSelect value={type} onChange={setType} />
      </td>

      {/* Solid */}
      <td className="px-4 py-2.5 text-center">
        <Checkbox
          checked={solid}
          onCheckedChange={(checked) => setSolid(checked === true)}
        />
      </td>

      {/* Cost */}
      <td className="px-4 py-2.5">
        <Input
          value={costRaw}
          onChange={(e) => setCostRaw(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="—"
          className="h-7 text-sm tabular-nums bg-transparent"
        />
      </td>

      {/* Trials (empty for new) */}
      <td className="px-4 py-2.5 text-right text-muted-foreground">—</td>

      {/* Actions: submit / cancel */}
      <td className="px-1 py-2.5">
        <div className="flex flex-col items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-primary hover:text-primary"
            onClick={submit}
            disabled={!name.trim()}
          >
            <Check size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-destructive"
            onClick={onCancel}
          >
            <X size={14} />
          </Button>
        </div>
      </td>
    </tr>
  );
};

/* ── Existing ingredient row ─────────────────────────────────────── */

interface RowProps {
  ingredient: Ingredient;
  trialCount: number;
  onUpdate: (id: string, input: UpdateIngredientInput) => void;
  onDelete: (id: string) => void;
}

const IngredientRow = ({
  ingredient,
  trialCount,
  onUpdate,
  onDelete,
}: RowProps) => {
  const { id } = ingredient;
  const pinned = ingredient.pinned ?? false;

  return (
    <tr className="border-t border-border hover:bg-muted/50 transition-colors">
      {/* Pin */}
      <td className="px-2 py-2.5 text-center">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onUpdate(id, { pinned: !pinned })}
        >
          <Pin
            size={14}
            className={
              pinned
                ? "fill-amber-400 text-amber-500"
                : "text-muted-foreground"
            }
          />
        </Button>
      </td>

      {/* Name */}
      <td className="px-4 py-2.5 font-medium">
        <InlineInput
          value={ingredient.name}
          onCommit={(name) => onUpdate(id, { name })}
        />
      </td>

      {/* Abbreviation */}
      <td className="px-4 py-2.5">
        <InlineInput
          value={ingredient.abbreviation ?? ""}
          onCommit={(abbreviation) => onUpdate(id, { abbreviation })}
          placeholder="—"
          className="font-mono text-xs"
        />
      </td>

      {/* Type */}
      <td className="px-4 py-2.5">
        <IngredientTypeSelect
          value={ingredient.type}
          onChange={(type) => onUpdate(id, { type })}
        />
      </td>

      {/* Solid */}
      <td className="px-4 py-2.5 text-center">
        <Checkbox
          checked={ingredient.solid ?? false}
          onCheckedChange={(checked) =>
            onUpdate(id, { solid: checked === true })
          }
        />
      </td>

      {/* Cost / lb */}
      <td className="px-4 py-2.5">
        <InlineInput
          value={
            ingredient.costPerLb != null
              ? `$${ingredient.costPerLb.toFixed(2)}`
              : ""
          }
          onCommit={(raw) => {
            const num = parseFloat(raw.replace(/[$,]/g, ""));
            if (!isNaN(num)) onUpdate(id, { costPerLb: num });
          }}
          placeholder="—"
          className="tabular-nums"
        />
      </td>

      {/* Trials (read-only) */}
      <td className="px-4 py-2.5 text-right text-muted-foreground tabular-nums">
        {trialCount}
      </td>

      {/* Delete */}
      <td className="px-2 py-2.5">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(id)}
        >
          <Trash2 size={14} />
        </Button>
      </td>
    </tr>
  );
};
