/**
 * Shared helpers for trial list display (card + table views).
 * Extracts formulation text and most recent evaluation data.
 */

import type { Trial, AnalysisLog } from "@/types/trial";
import type { TrialIngredient } from "@/types/ingredient";
import { getLogLabel } from "@/lib/analysisLog";
import { calcScoresFromEvaluations, type SensoryScores } from "@/lib/sensoryScores";

export interface FormulationItem {
  abbreviation: string;
  percentage: number;
}

/**
 * Get pinned ingredients formatted for display.
 * Returns abbreviation + percentage for each pinned ingredient.
 * Checks both trial-level pinned (ti.pinned) and master ingredient pinned (ti.ingredient.pinned).
 */
export function getPinnedFormulation(ingredients: TrialIngredient[]): FormulationItem[] {
  return ingredients
    .filter((ti) => ti.pinned || ti.ingredient.pinned)
    .map((ti) => ({
      abbreviation: ti.ingredient.abbreviation || ti.ingredient.name,
      percentage: ti.percentage,
    }));
}

export interface MostRecentEval {
  label: string;
  scores: SensoryScores;
  photo?: string;
}

/**
 * Find the most recently created analysis log that has evaluations,
 * compute its scores, and return the log label + first photo.
 */
export function getMostRecentEval(trial: Trial): MostRecentEval | null {
  // Sort logs by createdAt descending to find the most recent
  const logsWithEvals = trial.analysisLogs
    .filter((log) => log.evaluations.length > 0)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (logsWithEvals.length === 0) return null;

  const log = logsWithEvals[0];
  return {
    label: getLogLabel(log),
    scores: calcScoresFromEvaluations(log.evaluations),
    photo: log.photos?.[0],
  };
}

/**
 * Get all photos from a trial's analysis logs with their labels.
 * Returns the first photo from each log, sorted by log creation date.
 */
export function getTrialPhotos(logs: AnalysisLog[]): { src: string; label: string }[] {
  return logs
    .filter((log) => log.photos?.[0] != null)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((log) => ({
      src: log.photos![0],
      label: getLogLabel(log),
    }));
}
