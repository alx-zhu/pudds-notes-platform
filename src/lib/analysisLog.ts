import { formatStorageTime } from "./storageTime";
import { SENSORY_METRICS } from "@/config/trial.config";
import type { AnalysisLog, SensoryEvaluation, PartialSensoryMetrics } from "@/types/trial";

export const getLogLabel = (log: AnalysisLog): string => {
  const storage = formatStorageTime(log.storageTimeMinutes);
  return `${log.thermalProcessingType} · ${storage}`;
};

/**
 * Sort logs by thermal processing type (alphabetical) then by storage time
 * (descending — longest time first).
 */
export const sortLogs = (logs: AnalysisLog[]): AnalysisLog[] =>
  [...logs].sort((a, b) => {
    const typeCmp = a.thermalProcessingType.localeCompare(b.thermalProcessingType);
    if (typeCmp !== 0) return typeCmp;
    return b.storageTimeMinutes - a.storageTimeMinutes;
  });

/**
 * Average each sensory metric across all evaluations in a log.
 * Skips null/undefined values per metric — only averages what exists.
 */
export const averageEvaluationMetrics = (
  evaluations: SensoryEvaluation[],
): PartialSensoryMetrics => {
  if (evaluations.length === 0) return {};
  const result: PartialSensoryMetrics = {};
  for (const metric of SENSORY_METRICS) {
    const vals = evaluations
      .map((e) => e.metrics[metric.key])
      .filter((v): v is number => v != null);
    if (vals.length > 0) {
      result[metric.key] =
        Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 10) / 10;
    }
  }
  return result;
};

/** True if any evaluation has at least one rated metric. */
export const hasEvaluationData = (evaluations: SensoryEvaluation[]): boolean =>
  evaluations.some((e) =>
    Object.values(e.metrics).some((v) => v != null && v >= 1),
  );
