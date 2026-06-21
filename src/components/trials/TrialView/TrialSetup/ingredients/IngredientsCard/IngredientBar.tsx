import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { INGREDIENT_CHART_COLORS } from "@/config/trial.config";
import type { TrialIngredient } from "@/types/ingredient";

const UNDEFINED_COLOR = "#e5e7eb";

interface IngredientBarProps {
  chartSorted: TrialIngredient[];
  hasRemainder: boolean;
  remainder: number;
}

export function IngredientBar({ chartSorted, hasRemainder, remainder }: IngredientBarProps) {
  return (
    <div className="px-5 pt-3">
      <TooltipProvider>
        <div className="flex h-5 w-full overflow-hidden rounded gap-px">
          {chartSorted.map((ti, i) => {
            const color = INGREDIENT_CHART_COLORS[i % INGREDIENT_CHART_COLORS.length];
            return (
              <Tooltip key={ti.ingredient.id}>
                <TooltipTrigger asChild>
                  <div
                    className="h-full cursor-default"
                    style={{ flex: ti.percentage, backgroundColor: color }}
                  />
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={4}>
                  <span className="font-medium">{ti.ingredient.name}</span>
                  <span className="opacity-70 ml-1.5">
                    {parseFloat(ti.percentage.toFixed(3))}%
                  </span>
                </TooltipContent>
              </Tooltip>
            );
          })}
          {hasRemainder && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="h-full cursor-default"
                  style={{ flex: remainder, backgroundColor: UNDEFINED_COLOR }}
                />
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={4}>
                <span className="font-medium">Undefined</span>
                <span className="opacity-70 ml-1.5">
                  {parseFloat(remainder.toFixed(3))}%
                </span>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </TooltipProvider>
    </div>
  );
}
