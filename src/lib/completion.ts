import {
  SENSORY_CATEGORIES,
  SENSORY_METRICS,
  PHOTO_GRID_CELLS,
} from "@/config/trial.config";
import type { Trial, CompletionStatus, TrialCompletion } from "@/types/trial";

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

function getSensoryStatus(trial: Trial): CompletionStatus {
  const done = SENSORY_CATEGORIES.filter(({ key }) => {
    const entry = trial.sensory[key];
    if (!entry) return false;
    return SENSORY_METRICS.every((m) => entry[m.key] != null && entry[m.key] >= 1);
  }).length;
  if (done === 0) return "not-started";
  if (done === SENSORY_CATEGORIES.length) return "done";
  return "partial";
}

function getPhotosStatus(trial: Trial): CompletionStatus {
  const filled = PHOTO_GRID_CELLS.filter(({ key }) => Boolean(trial.photos[key])).length;
  if (filled === 0) return "not-started";
  if (filled === PHOTO_GRID_CELLS.length) return "done";
  return "partial";
}

export function computeCompletion(trial: Trial): TrialCompletion {
  const setup = getSetupStatus(trial);
  const sensory = getSensoryStatus(trial);
  const photos = getPhotosStatus(trial);
  const completedSections = [setup, sensory, photos].filter(
    (s) => s === "done",
  ).length;
  return { setup, sensory, photos, completedSections, isFullyComplete: completedSections === 3 };
}

export function countDoneSensoryCategories(trial: Trial): number {
  return SENSORY_CATEGORIES.filter(({ key }) => {
    const entry = trial.sensory[key];
    if (!entry) return false;
    return SENSORY_METRICS.every((m) => entry[m.key] != null && entry[m.key] >= 1);
  }).length;
}
