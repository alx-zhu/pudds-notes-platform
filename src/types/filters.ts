import type {
  ProcessingType,
  Flavor,
  ScoreCategoryKey,
} from "@/config/trial.config";

export interface TrialFilters {
  processingType: ProcessingType | null;
  flavor: Flavor | null;
}

export const EMPTY_FILTERS: TrialFilters = {
  processingType: null,
  flavor: null,
};

export type SortByScore = ScoreCategoryKey | "overall" | null;

export const DEFAULT_SORT: SortByScore = null;
