import { useMemo } from "react";
import { SENSORY_METRICS } from "@/config/trial.config";
import type { SensoryMetricKey } from "@/config/trial.config";
import type { AnalysisLog } from "@/types/trial";

interface CardSensoryInfoProps {
  matchingLogs: AnalysisLog[];
  activeMetricKeys: SensoryMetricKey[];
}

export const CardSensoryInfo = ({
  matchingLogs,
  activeMetricKeys,
}: CardSensoryInfoProps) => {
  const averages = useMemo(() => {
    const result: Partial<Record<SensoryMetricKey, number>> = {};
    for (const key of activeMetricKeys) {
      const values = matchingLogs
        .map((log) => log.metrics[key])
        .filter((v): v is number => v != null);
      if (values.length > 0) {
        result[key] = values.reduce((sum, v) => sum + v, 0) / values.length;
      }
    }
    return result;
  }, [matchingLogs, activeMetricKeys]);

  if (activeMetricKeys.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-[11px] text-muted-foreground/60">
        No sensory filters active
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col justify-start gap-1 overflow-y-auto py-0.5">
      {activeMetricKeys.map((key) => {
        const metric = SENSORY_METRICS.find((m) => m.key === key);
        if (!metric) return null;
        const value = averages[key];

        return (
          <div key={key} className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground w-18 truncate shrink-0">
              {metric.label}
            </span>
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{
                  width: `${((value ?? 0) / metric.max) * 100}%`,
                }}
              />
            </div>
            <span className="text-[11px] tabular-nums text-foreground w-5 text-right shrink-0">
              {value != null ? value.toFixed(1) : "–"}
            </span>
          </div>
        );
      })}
    </div>
  );
};
