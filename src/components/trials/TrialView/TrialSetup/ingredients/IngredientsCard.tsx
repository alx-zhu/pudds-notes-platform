import { useMemo, useState } from "react";
import {
  Pencil,
  Plus,
  Layers,
  Pin,
  ChevronDown,
  ChevronUp,
  DollarSign,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useReadOnly } from "@/contexts/ReadOnlyContext";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { IngredientsModal } from "@/components/trials/TrialView/TrialSetup/ingredients/IngredientsModal";
import { useTrial } from "@/hooks/useTrials";
import { INGREDIENT_CHART_COLORS } from "@/config/trial.config";
import { calcTrialCost } from "@/lib/trialDisplay";
import type { TrialIngredient } from "@/types/ingredient";

const MAX_VISIBLE = 5;
const UNDEFINED_COLOR = "#e5e7eb";

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

interface TooltipPayloadItem {
  name: string;
  value: number;
}

interface BarTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  activeBarName?: string | null;
}

const CustomTooltip = ({ active, payload, activeBarName }: BarTooltipProps) => {
  if (!active || !payload?.length || !activeBarName) return null;
  const item = payload.find((p) => p.name === activeBarName);
  if (!item) return null;
  return (
    <div className="bg-popover border border-border rounded-md px-2.5 py-1.5 text-xs shadow-md">
      <span className="font-medium">{item.name}</span>
      <span className="text-muted-foreground ml-1.5">{item.value}%</span>
    </div>
  );
};

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
                      width: maxCost > 0 ? `${(item.cost / maxCost) * 100}%` : "0%",
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
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);
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

  // Single-row dataset for stacked horizontal bar
  const barData = useMemo(() => {
    const obj: Record<string, number> = {};
    chartSorted.forEach((ti) => {
      obj[ti.ingredient.name] = ti.percentage;
    });
    if (hasRemainder) obj["Undefined"] = remainder;
    return [obj];
  }, [chartSorted, hasRemainder, remainder]);

  const totalBars = chartSorted.length + (hasRemainder ? 1 : 0);

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
                  {/* Stacked horizontal bar */}
                  <div className="px-5 pt-3">
                    <ResponsiveContainer width="100%" height={20}>
                      <BarChart
                        layout="vertical"
                        data={barData}
                        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                      >
                        <XAxis type="number" hide />
                        <YAxis type="category" hide />
                        <Tooltip
                          content={(props) => (
                            <CustomTooltip {...props} activeBarName={hoveredBar} />
                          )}
                          cursor={false}
                        />
                        {chartSorted.map((ti, i) => (
                          <Bar
                            key={ti.ingredient.id}
                            dataKey={ti.ingredient.name}
                            name={ti.ingredient.name}
                            stackId="a"
                            fill={INGREDIENT_CHART_COLORS[i % INGREDIENT_CHART_COLORS.length]}
                            radius={
                              totalBars === 1
                                ? [4, 4, 4, 4]
                                : i === 0
                                  ? [4, 0, 0, 4]
                                  : !hasRemainder && i === chartSorted.length - 1
                                    ? [0, 4, 4, 0]
                                    : [0, 0, 0, 0]
                            }
                            onMouseEnter={() => setHoveredBar(ti.ingredient.name)}
                            onMouseLeave={() => setHoveredBar(null)}
                          />
                        ))}
                        {hasRemainder && (
                          <Bar
                            dataKey="Undefined"
                            name="Undefined"
                            stackId="a"
                            fill={UNDEFINED_COLOR}
                            radius={[0, 4, 4, 0]}
                            onMouseEnter={() => setHoveredBar("Undefined")}
                            onMouseLeave={() => setHoveredBar(null)}
                          />
                        )}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Custom legend: pinned first, capped at MAX_VISIBLE */}
                  <div className="px-5 py-3">
                    <table className="w-full text-xs border-collapse">
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
