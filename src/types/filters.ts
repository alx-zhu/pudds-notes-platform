import type {
  ProcessingType,
  Flavor,
  SensoryMetricKey,
} from "@/config/trial.config";

export interface SensoryRange {
  min: number;
  max: number;
}

export interface TrialFilters {
  processingTypes: ProcessingType[];
  flavors: Flavor[];
  thermalProcessingTypes: string[];
  storageTimeMinutes: number[];
  ingredients: string[];
  dateRange: {
    from: string | null; // ISO date string
    to: string | null;
  };
  sensoryRanges: Partial<Record<SensoryMetricKey, SensoryRange>>;
}

export const EMPTY_FILTERS: TrialFilters = {
  processingTypes: [],
  flavors: [],
  thermalProcessingTypes: [],
  storageTimeMinutes: [],
  ingredients: [],
  dateRange: { from: null, to: null },
  sensoryRanges: {},
};
