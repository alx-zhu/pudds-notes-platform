import mean from "lodash.mean";
import { formatStorageTime } from "./storageTime";
import type { MetricKey } from "@/config/sensoryForms";
import type { AnalysisLog, SensoryEvaluation, PartialSensoryMetrics } from "@/types/trial";

export const getLogLabel = (log: AnalysisLog): string =>
  formatStorageTime(log.storageTimeMinutes);

export const sortLogs = (logs: AnalysisLog[]): AnalysisLog[] =>
  [...logs].sort((a, b) => a.storageTimeMinutes - b.storageTimeMinutes);

export const averageEvaluationMetrics = (
  evaluations: SensoryEvaluation[],
): PartialSensoryMetrics => {
  if (evaluations.length === 0) return {};
  const keys = new Set(evaluations.flatMap((e) => Object.keys(e.metrics) as MetricKey[]));
  const result: PartialSensoryMetrics = {};
  for (const key of keys) {
    const vals = evaluations
      .map((e) => e.metrics[key])
      .filter((v): v is number => v != null);
    if (vals.length > 0) {
      result[key] = Math.round(mean(vals) * 10) / 10;
    }
  }
  return result;
};

export const hasEvaluationData = (evaluations: SensoryEvaluation[]): boolean =>
  evaluations.some((e) =>
    Object.values(e.metrics).some((v) => v != null && v >= 1),
  );
