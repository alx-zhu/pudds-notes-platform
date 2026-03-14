import { useMemo } from "react";
import { BarChart2 } from "lucide-react";
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
import { useTrials } from "@/hooks/useTrials";
import { SENSORY_METRICS } from "@/config/trial.config";
import type { PartialSensoryMetrics } from "@/types/trial";

const METRIC_SHORT: Record<string, string> = {
  tasteRating: "Taste Rat.",
  sweetnessIntensity: "Sweetness Int.",
  sweetnessRating: "Sweetness Rat.",
  flavorIntensity: "Flavor Int.",
  aftertasteIntensity: "Aftertaste",
  thicknessIntensity: "Thickness",
  textureIntensity: "Texture Int.",
  textureRating: "Texture Rat.",
  colorRating: "Color Rat.",
};

const CHART_COLORS = {
  current: "hsl(217, 91%, 60%)",
  average: "hsl(220, 14%, 70%)",
  grid: "#e8e8ec",
  tick: "#8c8c96",
  cursor: "rgba(0, 0, 0, 0.1)",
} as const;

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
            {p.dataKey === "current" ? "This Log" : "Other Logs Avg"}:
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
  logMetrics: PartialSensoryMetrics;
  hasData: boolean;
  onAddData: () => void;
}

export default function SensoryChart({
  trialId,
  logMetrics,
  hasData,
  onAddData,
}: Props) {
  const { data: allTrials = [] } = useTrials();

  const chartData = useMemo(() => {
    if (!hasData) return [];
    const otherLogs = allTrials
      .filter((t) => t.id !== trialId)
      .flatMap((t) => t.analysisLogs);
    return SENSORY_METRICS.map((metric) => {
      const current = logMetrics[metric.key] ?? 0;
      const otherVals = otherLogs
        .map((log) => log.metrics[metric.key])
        .filter((v): v is number => v != null && v >= 1);
      const avg =
        otherVals.length > 0
          ? Math.round(
              (otherVals.reduce((s, v) => s + v, 0) / otherVals.length) * 10,
            ) / 10
          : 0;
      return {
        name: METRIC_SHORT[metric.key] ?? metric.label,
        current,
        average: avg,
      };
    });
  }, [hasData, logMetrics, allTrials, trialId]);

  if (!hasData) {
    return (
      <div className="h-full min-h-90 flex flex-col items-center justify-center gap-3 bg-muted/20 rounded-xl ring-1 ring-border/40">
        <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
          <BarChart2 size={18} className="text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground text-center">
          No evaluation yet
        </p>
        <button
          type="button"
          onClick={onAddData}
          className="text-xs font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer"
        >
          Add sensory data
        </button>
      </div>
    );
  }

  return (
    <div className="bg-muted/20 rounded-xl ring-1 ring-border/40 p-3">
      <ResponsiveContainer width="100%" height={360}>
        <BarChart
          layout="vertical"
          data={chartData}
          barCategoryGap="40%"
          barGap={3}
          margin={{ top: 4, right: 20, left: 4, bottom: 4 }}
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
            tick={{ fontSize: 11, fill: CHART_COLORS.tick }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={110}
            tick={{ fontSize: 11, fill: CHART_COLORS.tick }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ fill: CHART_COLORS.cursor }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
            formatter={(value) =>
              value === "current" ? "This Log" : "Other Logs Avg"
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
  );
}
