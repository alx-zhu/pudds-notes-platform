import type { Trial, AnalysisLog } from "@/types/trial";
import type { TrialFilters } from "@/types/filters";

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
    filters.ingredients.length > 0 ||
    filters.dateRange.from !== null ||
    filters.dateRange.to !== null;

  const hasLogFilters =
    filters.thermalProcessingTypes.length > 0 ||
    filters.storageTimes.length > 0 ||
    Object.keys(filters.sensoryRanges).length > 0;

  return trials
    .map((trial): FilteredTrial | null => {
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

        if (
          filters.ingredients.length > 0 &&
          !trial.setup.variables.some((v) =>
            filters.ingredients.includes(v.ingredient),
          )
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
            filters.storageTimes.length > 0 &&
            !filters.storageTimes.includes(log.storageTime)
          )
            return false;

          for (const [key, range] of Object.entries(filters.sensoryRanges)) {
            const value = log.metrics[key as keyof typeof log.metrics];
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
  count += filters.storageTimes.length;
  count += filters.ingredients.length;
  if (filters.dateRange.from) count++;
  if (filters.dateRange.to) count++;
  count += Object.keys(filters.sensoryRanges).length;
  return count;
};
