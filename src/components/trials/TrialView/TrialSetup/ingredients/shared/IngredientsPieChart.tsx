import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { Variable } from "@/types/trial";

const SLICE_COLORS = [
  "#60a5fa", // blue-400
  "#f59e0b", // amber-400
  "#34d399", // emerald-400
  "#a78bfa", // violet-400
  "#f87171", // rose-400
  "#22d3ee", // cyan-400
  "#fb923c", // orange-400
  "#4ade80", // green-400
];

const UNDEFINED_COLOR = "#e5e7eb"; // gray-200

interface Props {
  variables: Variable[];
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number }>;
}

const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="bg-popover border border-border rounded-md px-2.5 py-1.5 text-xs shadow-md">
      <span className="font-medium">{item.name}</span>
      <span className="text-muted-foreground ml-1.5">{item.value}%</span>
    </div>
  );
};

export const IngredientsPieChart = ({ variables }: Props) => {
  const total = variables.reduce((sum, v) => sum + v.percentage, 0);
  const roundedTotal = Math.round(total * 10) / 10;

  const data = [
    ...variables.map((v, i) => ({
      name: v.ingredient || `Ingredient ${i + 1}`,
      value: v.percentage,
      color: SLICE_COLORS[i % SLICE_COLORS.length],
      isUndefined: false,
    })),
    ...(roundedTotal < 100
      ? [
          {
            name: "Undefined",
            value: 100 - roundedTotal,
            color: UNDEFINED_COLOR,
            isUndefined: true,
          },
        ]
      : []),
  ];

  return (
    <div className="h-full w-full flex flex-col items-center gap-3">
      <div className="flex-1 min-h-0 aspect-square max-w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="50%"
              outerRadius="80%"
              paddingAngle={1}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="shrink-0 flex flex-wrap justify-center gap-x-3 gap-y-1.5">
        {data.map((entry, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span
              className={`text-xs ${entry.isUndefined ? "text-muted-foreground/60 italic" : "text-foreground"}`}
            >
              {entry.name}
            </span>
            <span className="text-xs tabular-nums text-muted-foreground">
              {entry.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
