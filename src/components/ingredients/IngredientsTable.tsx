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

/* ── Column widths (px) ──────────────────────────────────────────── */

const COL_WIDTHS = {
  pin: 48,
  name: 200,
  abbreviation: 110,
  type: 140,
  solid: 70,
  cost: 110,
  avgScore: 140,
  trials: 70,
  actions: 48,
} as const;

/* ── Table ───────────────────────────────────────────────────────── */

interface Props {
  ingredients: Ingredient[];
  trialCounts: Map<string, number>;
  avgScores: Map<string, number>;
  isAdding: boolean;
  onUpdate: (id: string, input: UpdateIngredientInput) => void;
  onDelete: (id: string) => void;
  onCreate: (input: CreateIngredientInput) => void;
  onCancelAdd: () => void;
}

export const IngredientsTable = ({
  ingredients,
  trialCounts,
  avgScores,
  isAdding,
  onUpdate,
  onDelete,
  onCreate,
  onCancelAdd,
}: Props) => {
  return (
    <div className="rounded-xl bg-card ring-1 ring-border/60 overflow-hidden overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th
              className="px-4 py-3 bg-muted/30 w-12"
              style={{ width: COL_WIDTHS.pin }}
            />
            <th
              className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30"
              style={{ width: COL_WIDTHS.name }}
            >
              Ingredient
            </th>
            <th
              className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30"
              style={{ width: COL_WIDTHS.abbreviation }}
            >
              Abbrev
            </th>
            <th
              className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30"
              style={{ width: COL_WIDTHS.type }}
            >
              Type
            </th>
            <th
              className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30"
              style={{ width: COL_WIDTHS.solid }}
            >
              Solid
            </th>
            <th
              className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30"
              style={{ width: COL_WIDTHS.cost }}
            >
              Cost / g
            </th>
            <th
              className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30"
              style={{ width: COL_WIDTHS.avgScore }}
            >
              Avg Score
            </th>
            <th
              className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30"
              style={{ width: COL_WIDTHS.trials }}
            >
              Trials
            </th>
            <th
              className="px-4 py-3 bg-muted/30"
              style={{ width: COL_WIDTHS.actions }}
            />
          </tr>
        </thead>
        <tbody>
          {isAdding && (
            <NewIngredientRow onCreate={onCreate} onCancel={onCancelAdd} />
          )}
          {ingredients.length === 0 && !isAdding ? (
            <tr>
              <td
                colSpan={9}
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
                avgScore={avgScores.get(ing.id)}
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
      cost: !isNaN(cost) ? cost : undefined,
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
    <tr className="border-b border-border/40 bg-primary/5">
      {/* Pin */}
      <td className="px-4 py-3 text-center align-middle w-12" style={{ width: COL_WIDTHS.pin }}>
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
      <td className="px-4 py-3 align-middle" style={{ width: COL_WIDTHS.name }}>
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
      <td className="px-4 py-3 align-middle" style={{ width: COL_WIDTHS.abbreviation }}>
        <Input
          value={abbreviation}
          onChange={(e) => setAbbreviation(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="—"
          className="h-7 text-xs font-mono bg-transparent"
        />
      </td>

      {/* Type */}
      <td className="px-4 py-3 align-middle" style={{ width: COL_WIDTHS.type }}>
        <IngredientTypeSelect value={type} onChange={setType} />
      </td>

      {/* Solid */}
      <td className="px-4 py-3 text-center align-middle" style={{ width: COL_WIDTHS.solid }}>
        <Checkbox
          checked={solid}
          onCheckedChange={(checked) => setSolid(checked === true)}
        />
      </td>

      {/* Cost */}
      <td className="px-4 py-3 align-middle" style={{ width: COL_WIDTHS.cost }}>
        <Input
          value={costRaw}
          onChange={(e) => setCostRaw(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="—"
          className="h-7 text-sm tabular-nums bg-transparent"
        />
      </td>

      {/* Avg Score (empty for new) */}
      <td className="px-4 py-3 align-middle" style={{ width: COL_WIDTHS.avgScore }}>
        <span className="text-muted-foreground text-xs">—</span>
      </td>

      {/* Trials (empty for new) */}
      <td
        className="px-4 py-3 text-right text-muted-foreground align-middle"
        style={{ width: COL_WIDTHS.trials }}
      >
        —
      </td>

      {/* Actions: submit / cancel */}
      <td className="px-2 py-3 align-middle" style={{ width: COL_WIDTHS.actions }}>
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
  avgScore?: number;
  onUpdate: (id: string, input: UpdateIngredientInput) => void;
  onDelete: (id: string) => void;
}

const IngredientRow = ({
  ingredient,
  trialCount,
  avgScore,
  onUpdate,
  onDelete,
}: RowProps) => {
  const { id } = ingredient;
  const pinned = ingredient.pinned ?? false;

  return (
    <tr className="border-b border-border/40 last:border-b-0 hover:bg-muted/50 transition-colors">
      {/* Pin */}
      <td className="px-4 py-3 text-center align-middle w-12" style={{ width: COL_WIDTHS.pin }}>
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
      <td className="px-4 py-3 font-medium align-middle" style={{ width: COL_WIDTHS.name }}>
        <InlineInput
          value={ingredient.name}
          onCommit={(name) => onUpdate(id, { name })}
        />
      </td>

      {/* Abbreviation */}
      <td className="px-4 py-3 align-middle" style={{ width: COL_WIDTHS.abbreviation }}>
        <InlineInput
          value={ingredient.abbreviation ?? ""}
          onCommit={(abbreviation) => onUpdate(id, { abbreviation })}
          placeholder="—"
          className="font-mono text-xs"
        />
      </td>

      {/* Type */}
      <td className="px-4 py-3 align-middle" style={{ width: COL_WIDTHS.type }}>
        <IngredientTypeSelect
          value={ingredient.type}
          onChange={(type) => onUpdate(id, { type })}
        />
      </td>

      {/* Solid */}
      <td className="px-4 py-3 text-center align-middle" style={{ width: COL_WIDTHS.solid }}>
        <Checkbox
          checked={ingredient.solid ?? false}
          onCheckedChange={(checked) =>
            onUpdate(id, { solid: checked === true })
          }
        />
      </td>

      {/* Cost / g */}
      <td className="px-4 py-3 align-middle" style={{ width: COL_WIDTHS.cost }}>
        <InlineInput
          value={
            ingredient.cost != null
              ? `$${ingredient.cost.toFixed(4)}`
              : ""
          }
          onCommit={(raw) => {
            const num = parseFloat(raw.replace(/[$,]/g, ""));
            if (!isNaN(num)) onUpdate(id, { cost: num });
          }}
          placeholder="—"
          className="tabular-nums"
        />
      </td>

      {/* Avg Score */}
      <td className="px-4 py-3 align-middle" style={{ width: COL_WIDTHS.avgScore }}>
        {avgScore != null ? (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${(avgScore / 5) * 100}%` }}
              />
            </div>
            <span className="text-xs font-bold tabular-nums text-green-600 w-[26px] text-right">
              {avgScore.toFixed(1)}
            </span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </td>

      {/* Trials (read-only) */}
      <td
        className="px-4 py-3 text-right text-muted-foreground tabular-nums align-middle"
        style={{ width: COL_WIDTHS.trials }}
      >
        {trialCount}
      </td>

      {/* Delete */}
      <td className="px-2 py-3 align-middle" style={{ width: COL_WIDTHS.actions }}>
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
