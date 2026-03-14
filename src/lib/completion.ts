import { SENSORY_METRICS } from "@/config/trial.config";
import type { Trial, AnalysisLog, CompletionStatus, TrialCompletion } from "@/types/trial";

function getSetupStatus(trial: Trial): CompletionStatus {
  const s = trial.setup;
  if (!s) return "not-started";
  const hasCore = Boolean(s.date && s.processingType && s.flavor);
  const hasVars =
    s.variables.length > 0 &&
    s.variables.every((v) => v.ingredient.trim() !== "");
  if (hasCore && hasVars) return "done";
  return "partial";
}

export function isLogComplete(log: AnalysisLog): boolean {
  const allMetricsRated = SENSORY_METRICS.every(
    (m) => log.metrics[m.key] != null && (log.metrics[m.key] ?? 0) >= 1,
  );
  const hasPhoto = Boolean(log.photo);
  return allMetricsRated && hasPhoto;
}

function getAnalysisLogsStatus(trial: Trial): CompletionStatus {
  const logs = trial.analysisLogs;
  if (logs.length === 0) return "not-started";
  const completeCount = logs.filter(isLogComplete).length;
  if (completeCount === logs.length) return "done";
  return "partial";
}

export function computeCompletion(trial: Trial): TrialCompletion {
  const setup = getSetupStatus(trial);
  const analysisLogs = getAnalysisLogsStatus(trial);
  const completedSections = [setup, analysisLogs].filter(
    (s) => s === "done",
  ).length;
  return {
    setup,
    analysisLogs,
    completedSections,
    isFullyComplete: completedSections === 2,
  };
}
