import { useMemo } from "react";
import { calcScoresFromEvaluations } from "@/lib/sensoryScores";
import type { SensoryEvaluation } from "@/types/trial";
import { cn } from "@/lib/utils";

interface Props {
  evaluations: SensoryEvaluation[];
}

const MAX_SCORE = 5;

const CATEGORY_STYLES: Record<string, { bar: string; number: string }> = {
  taste: {
    bar: "bg-emerald-500",
    number: "text-emerald-700 dark:text-emerald-400",
  },
  texture: {
    bar: "bg-blue-500",
    number: "text-blue-700 dark:text-blue-400",
  },
  color: {
    bar: "bg-amber-500",
    number: "text-amber-700 dark:text-amber-400",
  },
};

export const SensoryScores = ({ evaluations }: Props) => {
  const scores = useMemo(
    () => calcScoresFromEvaluations(evaluations),
    [evaluations],
  );

  return (
    <div className="grid grid-cols-4 divide-x divide-border self-center">
      {scores.categories.map((cat) => {
        const style = CATEGORY_STYLES[cat.key];
        const pct = cat.score != null ? (cat.score / MAX_SCORE) * 100 : 0;
        return (
          <div key={cat.key} className="px-4 first:pl-0">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              {cat.label}
            </div>
            <div className="flex items-baseline gap-0.5">
              <span
                className={cn(
                  "text-2xl font-semibold tracking-tight leading-none",
                  cat.score != null
                    ? (style?.number ?? "text-foreground")
                    : "text-muted-foreground/40",
                )}
              >
                {cat.score != null ? cat.score.toFixed(1) : "\u2014"}
              </span>
              <span className="text-sm text-muted-foreground font-medium">
                / {MAX_SCORE}
              </span>
            </div>
            <div className="mt-2.5 h-1 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500 ease-out",
                  style?.bar ?? "bg-foreground",
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}

      {/* Overall */}
      <div className="px-4">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
          Overall
        </div>
        <div className="flex items-baseline gap-0.5">
          <span
            className={cn(
              "text-2xl font-semibold tracking-tight leading-none",
              scores.overall != null
                ? "text-foreground"
                : "text-muted-foreground/40",
            )}
          >
            {scores.overall != null ? scores.overall.toFixed(1) : "\u2014"}
          </span>
          <span className="text-sm text-muted-foreground font-medium">
            / {MAX_SCORE}
          </span>
        </div>
        <div className="mt-2.5 h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out bg-foreground/70"
            style={{
              width: `${scores.overall != null ? (scores.overall / MAX_SCORE) * 100 : 0}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
