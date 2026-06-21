import mean from "lodash.mean";
import {
  SCORE_CATEGORIES,
  SENSORY_METRIC_REGISTRY,
} from "@/config/sensoryForms";
import type { MetricKey, ScoreCategoryKey } from "@/config/sensoryForms";
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

function scoreMetric(value: number, ideal: number, max: number): number {
  const distance = Math.abs(value - ideal);
  const maxDistance = Math.max(ideal, max - ideal);
  return 5 * (1 - distance / maxDistance);
}

function summarize(scoresFor: (key: ScoreCategoryKey) => number[]): SensoryScores {
  const categories = SCORE_CATEGORIES.map(({ key, label }) => {
    const xs = scoresFor(key);
    return { key, label, score: xs.length ? mean(xs) : null };
  });
  const valid = categories.flatMap((c) => (c.score != null ? [c.score] : []));
  return { categories, overall: valid.length ? mean(valid) : null };
}

function calcSensoryScores(metrics: PartialSensoryMetrics): SensoryScores {
  const buckets: Partial<Record<ScoreCategoryKey, number[]>> = {};
  for (const key of Object.keys(metrics) as MetricKey[]) {
    const value = metrics[key];
    if (value == null) continue;
    const def = SENSORY_METRIC_REGISTRY[key];
    (buckets[def.category] ??= []).push(scoreMetric(value, def.ideal, def.max));
  }
  return summarize((key) => buckets[key] ?? []);
}

export function calcScoresFromEvaluations(evaluations: SensoryEvaluation[]): SensoryScores {
  const per = evaluations.map((e) => calcSensoryScores(e.metrics));
  return summarize((key) =>
    per.flatMap((s) => {
      const score = s.categories.find((c) => c.key === key)?.score;
      return score != null ? [score] : [];
    }),
  );
}
