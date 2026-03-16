import { Layers } from "lucide-react";
import { IngredientsPieChart } from "@/components/trials/TrialView/TrialSetup/ingredients/shared/IngredientsPieChart";
import { INGREDIENT_CHART_COLORS } from "@/config/trial.config";
import type { Variable } from "@/types/trial";

interface Props {
  variables: Variable[];
}

export const CardIngredientsInfo = ({ variables }: Props) => {
  if (variables.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-1.5">
        <Layers size={16} className="text-muted-foreground/40" />
        <span className="text-[11px] text-muted-foreground/60">
          No ingredients
        </span>
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center gap-2 px-3 py-2">
      {/* Pie chart — height driven by parent container */}
      <div className="h-full aspect-square shrink-0">
        <IngredientsPieChart variables={variables} showLegend={false} />
      </div>

      {/* Compact legend */}
      <div className="flex flex-col gap-1 min-w-0">
        {variables.map((v, i) => (
          <div key={v.id} className="flex items-center gap-1.5 min-w-0">
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{
                backgroundColor:
                  INGREDIENT_CHART_COLORS[i % INGREDIENT_CHART_COLORS.length],
              }}
            />
            <span className="text-[10px] text-foreground truncate">
              {v.ingredient || `Ingredient ${i + 1}`}
            </span>
            <span className="text-[10px] tabular-nums text-muted-foreground shrink-0">
              {v.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
