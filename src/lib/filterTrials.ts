import type { Trial, AnalysisLog } from "@/types/trial";
import type { TrialFilters } from "@/types/filters";
import { averageEvaluationMetrics } from "@/lib/analysisLog";

export interface FilteredTrial extends Trial {
  matchingLogs: AnalysisLog[];
}

export const filterTrials = (
  trials: Trial[],
  filters: TrialFilters,
): FilteredTrial[] => {
  const hasSetupFilters =
    filters.processingTypes.length > 0 ||
    filters.flavors.length > 0 ||
    filters.dateRange.from !== null ||
    filters.dateRange.to !== null;

  const hasIngredientFilter = filters.ingredients.length > 0;

  const hasLogFilters =
    filters.thermalProcessingTypes.length > 0 ||
    filters.storageTimeMinutes.length > 0 ||
    Object.keys(filters.sensoryRanges).length > 0;

  return trials
    .map((trial): FilteredTrial | null => {
      // Ingredient filter (ingredients are top-level, not nested in setup)
      if (
        hasIngredientFilter &&
        !trial.ingredients.some((ti) =>
          filters.ingredients.includes(ti.ingredient.name),
        )
      )
        return null;

      // Trial-level filters require setup to exist
      if (hasSetupFilters) {
        if (!trial.setup) return null;

        if (
          filters.processingTypes.length > 0 &&
          !filters.processingTypes.includes(trial.setup.processingType)
        )
          return null;

        if (
          filters.flavors.length > 0 &&
          !filters.flavors.includes(trial.setup.flavor)
        )
          return null;

        if (filters.dateRange.from && trial.setup.date < filters.dateRange.from)
          return null;

        if (filters.dateRange.to && trial.setup.date > filters.dateRange.to)
          return null;
      }

      // Log-level filters
      let matchingLogs = trial.analysisLogs;

      if (hasLogFilters) {
        matchingLogs = trial.analysisLogs.filter((log) => {
          if (
            filters.thermalProcessingTypes.length > 0 &&
            !filters.thermalProcessingTypes.includes(log.thermalProcessingType)
          )
            return false;

          if (
            filters.storageTimeMinutes.length > 0 &&
            !filters.storageTimeMinutes.includes(log.storageTimeMinutes)
          )
            return false;

          const avgMetrics = averageEvaluationMetrics(log.evaluations);
          for (const [key, range] of Object.entries(filters.sensoryRanges)) {
            const value = avgMetrics[key as keyof typeof avgMetrics];
            if (value == null || value < range.min || value > range.max)
              return false;
          }

          return true;
        });

        if (matchingLogs.length === 0) return null;
      }

      return { ...trial, matchingLogs };
    })
    .filter((t): t is FilteredTrial => t !== null);
};

export const countActiveFilters = (filters: TrialFilters): number => {
  let count = 0;
  count += filters.processingTypes.length;
  count += filters.flavors.length;
  count += filters.thermalProcessingTypes.length;
  count += filters.storageTimeMinutes.length;
  count += filters.ingredients.length;
  if (filters.dateRange.from) count++;
  if (filters.dateRange.to) count++;
  count += Object.keys(filters.sensoryRanges).length;
  return count;
};
