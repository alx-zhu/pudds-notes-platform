import {
  SENSORY_METRICS,
  SENSORY_IDEAL_SCORES,
  SENSORY_SCORE_CATEGORIES,
} from "@/config/trial.config";
import type { SensoryMetricKey } from "@/config/trial.config";
import type { PartialSensoryMetrics, SensoryEvaluation } from "@/types/trial";

export interface CategoryScore {
  key: string;
  label: string;
  score: number | null;
}

export interface SensoryScores {
  categories: CategoryScore[];
  overall: number | null;
}

/**
 * Score a single metric value against its ideal.
 * Score = 5 × (1 - distance / maxDistance)
 * where distance = |actual - ideal| and maxDistance = max(ideal, max - ideal).
 */
export function scoreMetric(key: SensoryMetricKey, value: number): number {
  const ideal = SENSORY_IDEAL_SCORES[key];
  const metric = SENSORY_METRICS.find((m) => m.key === key);
  const max = metric?.max ?? 5;

  const distance = Math.abs(value - ideal);
  const maxDistance = Math.max(ideal, max - ideal);

  return 5 * (1 - distance / maxDistance);
}

/**
 * Calculate the score for a category given averaged metrics.
 * Returns null if no metrics in the category have values.
 */
export function calcCategoryScore(
  metricKeys: SensoryMetricKey[],
  metrics: PartialSensoryMetrics,
): number | null {
  const scores: number[] = [];

  for (const key of metricKeys) {
    const value = metrics[key];
    if (value != null) {
      scores.push(scoreMetric(key, value));
    }
  }

  if (scores.length === 0) return null;
  return scores.reduce((sum, s) => sum + s, 0) / scores.length;
}

/**
 * Calculate all category scores and overall from a set of metrics.
 */
export function calcSensoryScores(metrics: PartialSensoryMetrics): SensoryScores {
  const categories: CategoryScore[] = SENSORY_SCORE_CATEGORIES.map((cat) => ({
    key: cat.key,
    label: cat.label,
    score: calcCategoryScore(cat.metricKeys, metrics),
  }));

  const validScores = categories
    .map((c) => c.score)
    .filter((s): s is number => s != null);

  const overall =
    validScores.length > 0
      ? validScores.reduce((sum, s) => sum + s, 0) / validScores.length
      : null;

  return { categories, overall };
}

/**
 * Average metrics across multiple evaluations, then calculate scores.
 * This is the main entry point for the SensoryScores component.
 */
export function calcScoresFromEvaluations(
  evaluations: SensoryEvaluation[],
): SensoryScores {
  if (evaluations.length === 0) {
    return calcSensoryScores({});
  }

  // Average each metric across all evaluations
  const averaged: PartialSensoryMetrics = {};

  for (const metric of SENSORY_METRICS) {
    const values: number[] = [];
    for (const ev of evaluations) {
      const val = ev.metrics[metric.key];
      if (val != null) values.push(val);
    }
    if (values.length > 0) {
      averaged[metric.key] = values.reduce((sum, v) => sum + v, 0) / values.length;
    }
  }

  return calcSensoryScores(averaged);
}
