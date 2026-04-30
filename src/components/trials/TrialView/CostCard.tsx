import { useMemo } from "react";
import { DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useTrial } from "@/hooks/useTrials";
import { calcTrialCost } from "@/lib/trialDisplay";

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

export const CostCard = ({ trialId }: Props) => {
  const { data: trial } = useTrial(trialId);
  const ingredients = trial?.ingredients ?? [];

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
    <Card className="flex flex-col overflow-hidden gap-0 shrink-0">
      <CardHeader className="py-3 px-5 space-y-0 border-b shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-green-100 flex items-center justify-center">
              <DollarSign size={11} className="text-green-600" />
            </div>
            <span className="text-sm font-semibold text-foreground">
              Cost Analysis
            </span>
          </div>
        </div>
      </CardHeader>

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
    </Card>
  );
};
