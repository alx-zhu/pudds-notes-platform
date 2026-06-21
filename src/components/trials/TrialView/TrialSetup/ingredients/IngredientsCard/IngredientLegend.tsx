import { Pin } from "lucide-react";
import { INGREDIENT_CHART_COLORS } from "@/config/trial.config";
import type { TrialIngredient } from "@/types/ingredient";

const UNDEFINED_COLOR = "#e5e7eb";

interface IngredientLegendProps {
  visibleLegend: TrialIngredient[];
  colorByIngredientId: Map<string, string>;
  hasRemainder: boolean;
  expanded: boolean;
  remainder: number;
}

export function IngredientLegend({
  visibleLegend,
  colorByIngredientId,
  hasRemainder,
  expanded,
  remainder,
}: IngredientLegendProps) {
  return (
    <div className="px-5 py-3">
      <table className="w-full text-xs border-collapse">
        <tbody>
          {visibleLegend.map((ti) => {
            const isPinned = ti.pinned || ti.ingredient.pinned;
            const color =
              colorByIngredientId.get(ti.ingredient.id) ?? INGREDIENT_CHART_COLORS[0];
            return (
              <LegendRow
                key={ti.ingredient.id}
                color={color}
                name={ti.ingredient.name}
                percentage={ti.percentage}
                isPinned={!!isPinned}
              />
            );
          })}
          {hasRemainder && expanded && (
            <LegendRow
              color={UNDEFINED_COLOR}
              name="Undefined"
              percentage={remainder}
              isPinned={false}
              isUndefined
            />
          )}
        </tbody>
      </table>
    </div>
  );
}

interface LegendRowProps {
  color: string;
  name: string;
  percentage: number;
  isPinned: boolean;
  isUndefined?: boolean;
}

function LegendRow({ color, name, percentage, isPinned, isUndefined }: LegendRowProps) {
  return (
    <tr className="border-t border-border/50 first:border-t-0">
      <td className="py-1 pr-2 w-4">
        <span className="block h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      </td>
      <td
        className={`py-1 pr-1 ${isUndefined ? "text-muted-foreground/60 italic" : "text-foreground"}`}
      >
        <span className="flex items-center gap-1">
          {isPinned && (
            <Pin size={9} className="fill-amber-400 text-amber-500 shrink-0" />
          )}
          {name}
        </span>
      </td>
      <td className="py-1 tabular-nums text-muted-foreground text-right">
        {parseFloat(percentage.toFixed(3))}%
      </td>
    </tr>
  );
}
