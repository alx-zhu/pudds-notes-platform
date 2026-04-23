import {
  SENSORY_METRICS,
  SENSORY_IDEAL_SCORES,
  SENSORY_SCORE_CATEGORIES,
} from "@/config/trial.config";
import type { SensoryMetricKey, ScoreCategoryKey } from "@/config/trial.config";
import type { PartialSensoryMetrics, SensoryEvaluation } from "@/types/trial";

export interface CategoryScore {
  key: ScoreCategoryKey;
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
 * Calculate scores per evaluation, then average category scores across evals.
 * This ensures the "all" score matches the intuitive average of per-eval scores
 * even when evaluations have different subsets of metrics filled in.
 */
export function calcScoresFromEvaluations(
  evaluations: SensoryEvaluation[],
): SensoryScores {
  if (evaluations.length === 0) {
    return calcSensoryScores({});
  }

  const perEvalScores = evaluations.map((ev) => calcSensoryScores(ev.metrics));

  const categories: CategoryScore[] = SENSORY_SCORE_CATEGORIES.map((cat) => {
    const scores = perEvalScores
      .map((s) => s.categories.find((c) => c.key === cat.key)?.score ?? null)
      .filter((s): s is number => s !== null);
    return {
      key: cat.key,
      label: cat.label,
      score:
        scores.length > 0
          ? scores.reduce((sum, s) => sum + s, 0) / scores.length
          : null,
    };
  });

  const validScores = categories
    .map((c) => c.score)
    .filter((s): s is number => s !== null);

  const overall =
    validScores.length > 0
      ? validScores.reduce((sum, s) => sum + s, 0) / validScores.length
      : null;

  return { categories, overall };
}
