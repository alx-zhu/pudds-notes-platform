import { useMemo } from "react";
import { BarChart2, Pencil } from "lucide-react";
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
import { useSensoryComparison } from "@/hooks/useTrials";
import type { SensoryComparisonParams } from "@/hooks/useTrials";
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

const ChartTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}) => {
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
};

interface Props {
  comparison: SensoryComparisonParams;
  logMetrics: PartialSensoryMetrics;
  hasData: boolean;
  onAddData: () => void;
}

export const SensoryChart = ({
  comparison,
  logMetrics,
  hasData,
  onAddData,
}: Props) => {
  const { averages } = useSensoryComparison(comparison);

  const chartData = useMemo(() => {
    if (!hasData) return [];
    return SENSORY_METRICS.map((metric) => ({
      name: METRIC_SHORT[metric.key] ?? metric.label,
      current: logMetrics[metric.key] ?? 0,
      average: averages[metric.key],
    }));
  }, [hasData, logMetrics, averages]);

  if (!hasData) {
    return (
      <div
        className="h-full min-h-90 flex flex-col items-center justify-center gap-3 bg-muted/20 rounded-xl ring-1 ring-border/40 cursor-pointer hover:bg-muted/40 transition-colors"
        onClick={onAddData}
      >
        <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
          <BarChart2 size={18} className="text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground text-center">
          No evaluation yet
        </p>
        <p className="text-xs font-medium text-primary">Add sensory data</p>
      </div>
    );
  }

  return (
    <div className="relative bg-muted/20 rounded-xl ring-1 ring-border/40 p-3 group/chart">
      <button
        type="button"
        onClick={onAddData}
        className="absolute top-2.5 right-2.5 z-10 h-7 w-7 rounded-lg bg-muted/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/chart:opacity-100 transition-opacity cursor-pointer hover:bg-muted ring-1 ring-border/40"
      >
        <Pencil size={12} className="text-foreground" />
      </button>
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
};
