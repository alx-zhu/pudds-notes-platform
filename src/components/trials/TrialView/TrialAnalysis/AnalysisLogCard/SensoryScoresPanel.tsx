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

export const SensoryScoresPanel = ({ evaluations }: Props) => {
  const scores = useMemo(
    () => calcScoresFromEvaluations(evaluations),
    [evaluations],
  );

  const hasData = scores.overall != null;

  return (
    <div className="flex flex-col justify-center h-full">
      {/* Overall score — big centered number */}
      <div className="text-center pb-5 mb-5 border-b border-border">
        <div className="flex items-baseline justify-center gap-0.5">
          <span
            className={cn(
              "text-5xl font-bold tracking-tight leading-none",
              hasData ? "text-foreground" : "text-muted-foreground/30",
            )}
          >
            {hasData ? scores.overall!.toFixed(1) : "\u2014"}
          </span>
          <span className="text-base text-muted-foreground font-medium ml-0.5">
            / {MAX_SCORE}
          </span>
        </div>
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mt-1.5">
          Overall
        </div>
      </div>

      {/* Category scores — horizontal bars */}
      <div className="flex flex-col gap-5">
        {scores.categories.map((cat) => {
          const style = CATEGORY_STYLES[cat.key];
          const pct = cat.score != null ? (cat.score / MAX_SCORE) * 100 : 0;
          return (
            <div key={cat.key} className="flex items-center gap-4">
              <span className="text-sm font-semibold w-16 shrink-0 text-foreground">
                {cat.label}
              </span>
              <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500 ease-out",
                    style?.bar ?? "bg-foreground",
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span
                className={cn(
                  "text-2xl font-bold w-12 text-right shrink-0 tabular-nums",
                  cat.score != null
                    ? (style?.number ?? "text-foreground")
                    : "text-muted-foreground/40",
                )}
              >
                {cat.score != null ? cat.score.toFixed(1) : "\u2014"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
