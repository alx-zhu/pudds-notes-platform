import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { INGREDIENT_CHART_COLORS } from "@/config/trial.config";
import type { TrialIngredient } from "@/types/ingredient";

const UNDEFINED_COLOR = "#e5e7eb"; // gray-200

interface Props {
  ingredients: TrialIngredient[];
  showLegend?: boolean;
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

export const IngredientsPieChart = ({ ingredients, showLegend = true }: Props) => {
  const total = ingredients.reduce((sum, ti) => sum + ti.percentage, 0);
  const roundedTotal = Math.round(total * 10) / 10;

  const data = [
    ...[...ingredients]
      .sort((a, b) => b.percentage - a.percentage)
      .map((ti, i) => ({
        name: ti.ingredient.name || `Ingredient ${i + 1}`,
        value: ti.percentage,
        color: INGREDIENT_CHART_COLORS[i % INGREDIENT_CHART_COLORS.length],
        isUndefined: false,
      })),
    ...(roundedTotal < 100
      ? [
          {
            name: "Undefined",
            value: Math.round((100 - roundedTotal) * 1000) / 1000,
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
      {showLegend && (
        <table className="shrink-0 w-full text-xs border-collapse">
          <tbody>
            {data.map((entry, i) => (
              <tr key={i} className="border-t border-border/50 first:border-t-0">
                <td className="py-1 pr-2 w-4">
                  <span
                    className="block h-2 w-2 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                </td>
                <td className={`py-1 pr-3 ${entry.isUndefined ? "text-muted-foreground/60 italic" : "text-foreground"}`}>
                  {entry.name}
                </td>
                <td className="py-1 tabular-nums text-muted-foreground text-right">
                  {parseFloat(entry.value.toFixed(3))}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
