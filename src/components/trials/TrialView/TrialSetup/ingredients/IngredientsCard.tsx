import { useMemo, useState } from "react";
import {
  Pencil,
  Plus,
  Layers,
  Pin,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useReadOnly } from "@/contexts/ReadOnlyContext";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IngredientsPieChart } from "@/components/trials/TrialView/TrialSetup/ingredients/shared/IngredientsPieChart";
import { IngredientsModal } from "@/components/trials/TrialView/TrialSetup/ingredients/IngredientsModal";
import { useTrial } from "@/hooks/useTrials";
import { INGREDIENT_CHART_COLORS } from "@/config/trial.config";

const MAX_VISIBLE = 5;
const UNDEFINED_COLOR = "#e5e7eb";

interface Props {
  trialId: string;
}

export const IngredientsCard = ({ trialId }: Props) => {
  const { data: trial } = useTrial(trialId);
  const [modalOpen, setModalOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const isReadOnly = useReadOnly();

  const setup = trial?.setup;
  const ingredients = trial?.ingredients ?? [];

  // Pinned items first, then by percentage descending — matches chart sort
  const sortedForLegend = useMemo(() => {
    const byPercentage = [...ingredients].sort(
      (a, b) => b.percentage - a.percentage,
    );
    const pinned = byPercentage.filter(
      (ti) => ti.pinned || ti.ingredient.pinned,
    );
    const rest = byPercentage.filter(
      (ti) => !ti.pinned && !ti.ingredient.pinned,
    );
    return [...pinned, ...rest];
  }, [ingredients]);

  // Chart data sorted by percentage desc (same order as IngredientsPieChart internals)
  const chartSorted = useMemo(
    () => [...ingredients].sort((a, b) => b.percentage - a.percentage),
    [ingredients],
  );

  // Map ingredient id → chart color index so legend colors match the pie slices
  const colorByIngredientId = useMemo(() => {
    const map = new Map<string, string>();
    chartSorted.forEach((ti, i) => {
      map.set(
        ti.ingredient.id,
        INGREDIENT_CHART_COLORS[i % INGREDIENT_CHART_COLORS.length],
      );
    });
    return map;
  }, [chartSorted]);

  const total = ingredients.reduce((sum, ti) => sum + ti.percentage, 0);
  const roundedTotal = Math.round(total * 10) / 10;
  const hasRemainder = roundedTotal < 100;
  const remainder = Math.round((100 - roundedTotal) * 1000) / 1000;

  const visibleLegend = expanded
    ? sortedForLegend
    : sortedForLegend.slice(0, MAX_VISIBLE);
  const hasMore = sortedForLegend.length > MAX_VISIBLE;

  return (
    <>
      <Card className="flex flex-col overflow-hidden gap-0 shrink-0">
        <CardHeader className="py-3 px-5 space-y-0 border-b shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded bg-orange-100 flex items-center justify-center">
                <Layers size={11} className="text-orange-600" />
              </div>
              <span className="text-sm font-semibold text-foreground">
                Ingredients
              </span>
            </div>
            <div className="flex items-center gap-2">
              {!isReadOnly && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setModalOpen(true)}
                  disabled={!setup}
                  className="h-7 w-7 p-0"
                  title={
                    !setup
                      ? "Complete trial setup first"
                      : ingredients.length > 0
                        ? "Edit Ingredients"
                        : "Add Ingredients"
                  }
                >
                  {ingredients.length > 0 ? (
                    <Pencil size={13} />
                  ) : (
                    <Plus size={13} />
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {ingredients.length > 0 ? (
            <div className="px-5 py-3">
              {/* Pie chart — no built-in legend */}
              <div className="h-48">
                <IngredientsPieChart
                  ingredients={ingredients}
                  showLegend={false}
                />
              </div>

              {/* Custom legend: pinned first, capped at MAX_VISIBLE */}
              <table className="w-full text-xs border-collapse mt-3">
                <tbody>
                  {visibleLegend.map((ti) => {
                    const isPinned = ti.pinned || ti.ingredient.pinned;
                    const color =
                      colorByIngredientId.get(ti.ingredient.id) ??
                      INGREDIENT_CHART_COLORS[0];
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
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 px-6 py-8">
              <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                <Layers size={20} className="text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground mb-1">
                  No ingredients yet
                </p>
                <p className="text-xs text-muted-foreground">
                  Add the ingredients used in this trial
                </p>
              </div>
            </div>
          )}
        </CardContent>

        {hasMore && (
          <CardFooter className="justify-center border-t p-0">
            <button
              className="w-full flex items-center justify-center gap-1 py-3 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              onClick={() => setExpanded((e) => !e)}
            >
              {expanded ? (
                <>
                  <ChevronUp size={12} />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown size={12} />
                  {sortedForLegend.length - MAX_VISIBLE} more
                </>
              )}
            </button>
          </CardFooter>
        )}
      </Card>

      {setup && (
        <IngredientsModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          trialId={trialId}
          ingredients={ingredients}
          key={modalOpen ? "open" : "closed"}
        />
      )}
    </>
  );
};

interface LegendRowProps {
  color: string;
  name: string;
  percentage: number;
  isPinned: boolean;
  isUndefined?: boolean;
}

function LegendRow({
  color,
  name,
  percentage,
  isPinned,
  isUndefined,
}: LegendRowProps) {
  return (
    <tr className="border-t border-border/50 first:border-t-0">
      <td className="py-1 pr-2 w-4">
        <span
          className="block h-2 w-2 rounded-full"
          style={{ backgroundColor: color }}
        />
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
