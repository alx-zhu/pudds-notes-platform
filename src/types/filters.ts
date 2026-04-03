import type {
  ProcessingType,
  Flavor,
  ScoreCategoryKey,
} from "@/config/trial.config";

export interface TrialFilters {
  processingTypes: ProcessingType[];
  flavors: Flavor[];
  dateRange: {
    from: string | null; // ISO date string
    to: string | null;
  };
}

export const EMPTY_FILTERS: TrialFilters = {
  processingTypes: [],
  flavors: [],
  dateRange: { from: null, to: null },
};

export type SortByScore = ScoreCategoryKey | "overall" | null;

export const DEFAULT_SORT: SortByScore = null;
