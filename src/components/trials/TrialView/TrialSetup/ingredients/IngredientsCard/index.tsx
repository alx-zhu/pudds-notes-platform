import { useMemo, useState } from "react";
import {
  Pencil,
  Plus,
  Layers,
  ChevronDown,
  ChevronUp,
  DollarSign,
} from "lucide-react";
import { useReadOnly } from "@/contexts/ReadOnlyContext";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { IngredientsModal } from "../IngredientsModal";
import { IngredientBar } from "./IngredientBar";
import { IngredientLegend } from "./IngredientLegend";
import { useTrial } from "@/hooks/useTrials";
import { INGREDIENT_CHART_COLORS } from "@/config/trial.config";
import { calcTrialCost } from "@/lib/trialDisplay";
import type { TrialIngredient } from "@/types/ingredient";

const MAX_VISIBLE = 5;

const BAR_COLORS = [
  "#6366f1",
  "#3b82f6",
  "#22c55e",
  "#f87171",
  "#a855f7",
  "#f59e0b",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#06b6d4",
];

interface Props {
  trialId: string;
}

function CostTabContent({ ingredients }: { ingredients: TrialIngredient[] }) {
  const totalCost = useMemo(() => calcTrialCost(ingredients), [ingredients]);

  const breakdown = useMemo(() => {
    return ingredients
      .filter((ti) => ti.ingredient.cost != null)
      .map((ti) => ({
        label: ti.ingredient.abbreviation || ti.ingredient.name,
        cost: ti.ingredient.cost! * (ti.percentage / 100) * 170,
      }))
      .sort((a, b) => b.cost - a.cost);
  }, [ingredients]);

  const maxCost = breakdown.length > 0 ? breakdown[0].cost : 0;

  return (
    <CardContent className="px-5 py-4">
      {totalCost != null ? (
        <>
          <p className="text-3xl font-bold tabular-nums mb-3">
            ${totalCost.toFixed(3)}
            <span className="text-sm font-normal text-muted-foreground ml-2">
              per 170g serving
            </span>
          </p>

          <div className="flex flex-col gap-2">
            {breakdown.map((item, i) => (
              <div key={item.label} className="flex items-center gap-2.5">
                <span className="text-xs font-medium text-muted-foreground w-20 shrink-0 truncate">
                  {item.label}
                </span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width:
                        maxCost > 0 ? `${(item.cost / maxCost) * 100}%` : "0%",
                      backgroundColor: BAR_COLORS[i % BAR_COLORS.length],
                    }}
                  />
                </div>
                <span className="text-xs tabular-nums text-right text-muted-foreground w-12 shrink-0">
                  ${item.cost.toFixed(3)}
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 py-6">
          <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
            <DollarSign size={18} className="text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground mb-1">
              No cost data
            </p>
            <p className="text-xs text-muted-foreground">
              Add cost per gram to ingredients to see analysis
            </p>
          </div>
        </div>
      )}
    </CardContent>
  );
}

export const IngredientsCard = ({ trialId }: Props) => {
  const { data: trial } = useTrial(trialId);
  const [modalOpen, setModalOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const isReadOnly = useReadOnly();

  const setup = trial?.setup;
  const ingredients = useMemo(
    () => trial?.ingredients ?? [],
    [trial?.ingredients],
  );

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

  // Chart data sorted by percentage desc
  const chartSorted = useMemo(
    () => [...ingredients].sort((a, b) => b.percentage - a.percentage),
    [ingredients],
  );

  // Map ingredient id → chart color index so legend colors match the bar
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
        <Tabs defaultValue="formula" className="flex flex-col">
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
                <TabsList variant="default" className="h-7">
                  <TabsTrigger value="formula" className="text-xs px-2">
                    Formula
                  </TabsTrigger>
                  <TabsTrigger value="cost" className="text-xs px-2">
                    Cost
                  </TabsTrigger>
                </TabsList>
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

          <TabsContent value="formula">
            <CardContent className="p-0">
              {ingredients.length > 0 ? (
                <>
                  <IngredientBar
                    chartSorted={chartSorted}
                    hasRemainder={hasRemainder}
                    remainder={remainder}
                  />
                  <IngredientLegend
                    visibleLegend={visibleLegend}
                    colorByIngredientId={colorByIngredientId}
                    hasRemainder={hasRemainder}
                    expanded={expanded}
                    remainder={remainder}
                  />
                </>
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
          </TabsContent>

          <TabsContent value="cost">
            <CostTabContent ingredients={ingredients} />
          </TabsContent>
        </Tabs>
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
