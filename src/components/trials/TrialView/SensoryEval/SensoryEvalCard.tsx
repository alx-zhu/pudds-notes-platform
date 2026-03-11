import { useState, useMemo } from "react";
import { BarChart2, Activity } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SensoryEvalModal from "@/components/trials/TrialView/SensoryEval/SensoryEvalModal";
import { useTrial, useTrials } from "@/hooks/useTrials";
import { SENSORY_CATEGORIES, SENSORY_METRICS } from "@/config/trial.config";
import type { SensoryCategory } from "@/config/trial.config";
import type { SensoryMetrics } from "@/types/trial";
import { countDoneSensoryCategories } from "@/lib/completion";
import { cn } from "@/lib/utils";

const METRIC_SHORT: Record<string, string> = {
  tasteLikeness: "Taste Like.",
  sweetnessIntensity: "Sweetness Int.",
  sweetnessLikeness: "Sweetness Like.",
  flavorIntensity: "Flavor Int.",
  aftertasteIntensity: "Aftertaste",
  thicknessIntensity: "Thickness",
  textureIntensity: "Texture Int.",
  textureLikeness: "Texture Like.",
  colorLikeness: "Color Like.",
};

const CHART_COLORS = {
  current: "hsl(217, 91%, 60%)",
  average: "hsl(220, 14%, 82%)",
  grid: "#e8e8ec",
  tick: "#8c8c96",
  cursor: "rgba(0, 0, 0, 0.03)",
} as const;

function isCategoryDone(
  sensory: Partial<Record<SensoryCategory, SensoryMetrics>>,
  key: SensoryCategory,
): boolean {
  const entry = sensory[key];
  if (!entry) return false;
  return SENSORY_METRICS.every(
    (m) => entry[m.key] != null && entry[m.key] >= 1,
  );
}

interface TooltipPayload {
  dataKey: string;
  value: number | undefined;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold mb-1 text-foreground">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span
            className="inline-block w-2 h-2 rounded-full shrink-0"
            style={{
              background:
                p.dataKey === "current"
                  ? CHART_COLORS.current
                  : CHART_COLORS.average,
            }}
          />
          <span className="text-muted-foreground">
            {p.dataKey === "current" ? "This Trial" : "Other Trials Avg"}:
          </span>
          <span className="font-semibold text-foreground">
            {p.value != null ? p.value.toFixed(1) : "—"}
          </span>
        </div>
      ))}
    </div>
  );
}

interface Props {
  trialId: string;
}

export default function SensoryEvalCard({ trialId }: Props) {
  const { data: trial } = useTrial(trialId);
  const { data: allTrials = [] } = useTrials();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalCategory, setModalCategory] = useState<
    SensoryCategory | undefined
  >();
  const [selectedChart, setSelectedChart] = useState<SensoryCategory | null>(
    null,
  );

  const sensory = trial?.sensory ?? {};
  const doneCount = trial ? countDoneSensoryCategories(trial) : 0;
  const allDone = doneCount === SENSORY_CATEGORIES.length;

  const completedCats = SENSORY_CATEGORIES.filter((c) =>
    isCategoryDone(sensory, c.key),
  );
  const activeChartKey =
    selectedChart && isCategoryDone(sensory, selectedChart)
      ? selectedChart
      : (completedCats[0]?.key ?? null);

  const chartData = useMemo(() => {
    if (!activeChartKey || !trial) return [];
    const others = allTrials.filter((t) => t.id !== trialId);
    return SENSORY_METRICS.map((metric) => {
      const current = trial.sensory[activeChartKey]?.[metric.key] ?? 0;
      const otherVals = others
        .map((t) => t.sensory[activeChartKey]?.[metric.key])
        .filter((v): v is number => v != null && v >= 1);
      const avg =
        otherVals.length > 0
          ? Math.round(
              (otherVals.reduce((s, v) => s + v, 0) / otherVals.length) * 10,
            ) / 10
          : undefined;
      return {
        name: METRIC_SHORT[metric.key] ?? metric.label,
        current,
        average: avg,
      };
    });
  }, [activeChartKey, trial, allTrials, trialId]);

  function openModal(category?: SensoryCategory) {
    setModalCategory(category);
    setModalOpen(true);
  }

  function handleChipClick(key: SensoryCategory) {
    if (isCategoryDone(sensory, key)) {
      setSelectedChart(key);
    } else {
      openModal(key);
    }
  }

  return (
    <>
      <Card className="flex flex-col flex-1 min-h-0 overflow-hidden gap-0">
        <CardHeader className="py-3 px-5 flex-row items-center justify-between space-y-0 border-b shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-6 rounded-md bg-violet-100 flex items-center justify-center">
              <Activity size={13} className="text-violet-600" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              Sensory Evaluation
            </p>
          </div>
          {doneCount === 0 ? (
            <span className="text-xs text-muted-foreground">Not started</span>
          ) : (
            <div
              className={cn(
                "flex items-center gap-1.5 text-xs font-medium",
                allDone ? "text-emerald-600" : "text-amber-600",
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  allDone ? "bg-emerald-500" : "bg-amber-500",
                )}
              />
              {doneCount}/{SENSORY_CATEGORIES.length} done
            </div>
          )}
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-5 flex flex-col gap-4 min-h-0">
          {/* Category chips */}
          <div className="flex gap-2 flex-wrap shrink-0">
            {SENSORY_CATEGORIES.map((cat) => {
              const done = isCategoryDone(sensory, cat.key);
              const active = done && cat.key === activeChartKey;
              return (
                <button
                  key={cat.key}
                  onClick={() => handleChipClick(cat.key)}
                  className={cn(
                    "text-xs font-medium px-3 py-1.5 rounded-lg cursor-pointer transition-all whitespace-nowrap",
                    active &&
                      "bg-foreground text-background shadow-sm",
                    !active &&
                      done &&
                      "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100",
                    !done &&
                      "bg-muted text-muted-foreground hover:bg-muted/80 ring-1 ring-transparent hover:ring-border",
                  )}
                >
                  {cat.shortLabel}
                  {done && !active && " ✓"}
                </button>
              );
            })}
          </div>

          {/* Chart area */}
          {activeChartKey ? (
            <div className="flex-1 min-h-0 bg-muted/30 rounded-xl p-3 -mx-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={chartData}
                  margin={{ top: 4, right: 16, left: 4, bottom: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke={CHART_COLORS.grid}
                  />
                  <XAxis
                    type="number"
                    domain={[0, 6]}
                    tickCount={7}
                    tick={{ fontSize: 10, fill: CHART_COLORS.tick }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={110}
                    tick={{ fontSize: 10, fill: CHART_COLORS.tick }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={<ChartTooltip />}
                    cursor={{ fill: CHART_COLORS.cursor }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 11 }}
                    formatter={(value) =>
                      value === "current" ? "This Trial" : "Other Trials Avg"
                    }
                  />
                  <Bar
                    dataKey="current"
                    name="current"
                    fill={CHART_COLORS.current}
                    radius={[0, 4, 4, 0]}
                    barSize={10}
                  />
                  <Bar
                    dataKey="average"
                    name="average"
                    fill={CHART_COLORS.average}
                    radius={[0, 4, 4, 0]}
                    barSize={10}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                <BarChart2 size={18} className="text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                No evaluations recorded yet
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-center shrink-0">
          <Button
            size="sm"
            variant={allDone ? "outline" : "default"}
            onClick={() => openModal()}
            className="gap-2"
          >
            <BarChart2 size={14} />
            {allDone ? "Review Data" : "Add Data"}
          </Button>
        </CardFooter>
      </Card>

      {modalOpen && (
        <SensoryEvalModal
          key={String(modalOpen)}
          open={modalOpen}
          onOpenChange={setModalOpen}
          trialId={trialId}
          sensory={sensory}
          initialCategory={modalCategory}
        />
      )}
    </>
  );
}
