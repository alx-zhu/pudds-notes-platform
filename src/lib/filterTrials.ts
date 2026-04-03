import type { Trial } from "@/types/trial";
import type { TrialFilters, SortByScore } from "@/types/filters";
import { getMostRecentEval } from "@/lib/trialDisplay";

export const filterTrials = (
  trials: Trial[],
  filters: TrialFilters,
): Trial[] => {
  const hasFilters =
    filters.processingTypes.length > 0 ||
    filters.flavors.length > 0 ||
    filters.dateRange.from !== null ||
    filters.dateRange.to !== null;

  if (!hasFilters) return trials;

  return trials.filter((trial) => {
    if (!trial.setup) return false;

    if (
      filters.processingTypes.length > 0 &&
      !filters.processingTypes.includes(trial.setup.processingType)
    )
      return false;

    if (
      filters.flavors.length > 0 &&
      !filters.flavors.includes(trial.setup.flavor)
    )
      return false;

    if (filters.dateRange.from && trial.setup.date < filters.dateRange.from)
      return false;

    if (filters.dateRange.to && trial.setup.date > filters.dateRange.to)
      return false;

    return true;
  });
};

/** Sort trials by a score category (descending). Trials without scores sink to the bottom. Returns original order when sortBy is null. */
export const sortTrialsByScore = (
  trials: Trial[],
  sortBy: SortByScore,
): Trial[] => {
  if (sortBy == null) return trials;

  // Precompute scores once — avoids redundant getMostRecentEval calls in the comparator
  const scored = trials.map((trial) => ({
    trial,
    score: getScoreValue(trial, sortBy),
  }));

  scored.sort((a, b) => {
    // Nulls to the bottom
    if (a.score == null && b.score == null) return 0;
    if (a.score == null) return 1;
    if (b.score == null) return -1;

    return b.score - a.score;
  });

  return scored.map((s) => s.trial);
};

function getScoreValue(trial: Trial, sortBy: NonNullable<SortByScore>): number | null {
  const eval_ = getMostRecentEval(trial);
  if (!eval_) return null;

  if (sortBy === "overall") return eval_.scores.overall;

  const cat = eval_.scores.categories.find((c) => c.key === sortBy);
  return cat?.score ?? null;
}

export const countActiveFilters = (filters: TrialFilters): number => {
  let count = 0;
  count += filters.processingTypes.length;
  count += filters.flavors.length;
  if (filters.dateRange.from) count++;
  if (filters.dateRange.to) count++;
  return count;
};
