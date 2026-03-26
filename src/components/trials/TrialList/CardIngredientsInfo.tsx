import { Layers } from "lucide-react";
import { IngredientsPieChart } from "@/components/trials/TrialView/TrialSetup/ingredients/shared/IngredientsPieChart";
import { INGREDIENT_CHART_COLORS } from "@/config/trial.config";
import type { TrialIngredient } from "@/types/ingredient";

interface Props {
  ingredients: TrialIngredient[];
}

export const CardIngredientsInfo = ({ ingredients }: Props) => {
  if (ingredients.length === 0) {
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
        <IngredientsPieChart ingredients={ingredients} showLegend={false} />
      </div>

      {/* Compact legend */}
      <div className="flex flex-col gap-1 min-w-0">
        {ingredients.map((ti, i) => (
          <div key={ti.ingredient.id} className="flex items-center gap-1.5 min-w-0">
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{
                backgroundColor:
                  INGREDIENT_CHART_COLORS[i % INGREDIENT_CHART_COLORS.length],
              }}
            />
            <span className="text-[11px] text-foreground truncate">
              {ti.ingredient.name || `Ingredient ${i + 1}`}
            </span>
            <span className="text-[11px] tabular-nums text-muted-foreground shrink-0">
              {ti.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
