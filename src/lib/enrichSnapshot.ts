import type { Trial, AnalysisLog } from "@/types/trial";
import type { SensoryScores } from "@/lib/sensoryScores";
import type { PartialSensoryMetrics } from "@/types/trial";
import { calcScoresFromEvaluations } from "@/lib/sensoryScores";
import { averageEvaluationMetrics, hasEvaluationData } from "@/lib/analysisLog";

export interface EnrichedAnalysisLog extends AnalysisLog {
  computedScores: SensoryScores;
  averagedMetrics: PartialSensoryMetrics;
}

export interface EnrichedTrial extends Omit<Trial, "analysisLogs"> {
  analysisLogs: EnrichedAnalysisLog[];
  mostRecentScores: SensoryScores | null;
}

const enrichLog = (log: AnalysisLog): EnrichedAnalysisLog => ({
  ...log,
  computedScores: calcScoresFromEvaluations(log.evaluations),
  averagedMetrics: averageEvaluationMetrics(log.evaluations),
});

const findMostRecentScores = (logs: AnalysisLog[]): SensoryScores | null => {
  const sorted = [...logs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const recent = sorted.find((log) => hasEvaluationData(log.evaluations));
  return recent ? calcScoresFromEvaluations(recent.evaluations) : null;
};

export const enrichTrialsForSnapshot = (trials: Trial[]): EnrichedTrial[] => {
  if (!Array.isArray(trials)) return [];
  return trials.map((trial) => ({
    ...trial,
    analysisLogs: trial.analysisLogs.map(enrichLog),
    mostRecentScores: findMostRecentScores(trial.analysisLogs),
  }));
};
