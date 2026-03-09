import type {
  SensoryCategory,
  SensoryMetricKey,
  PhotoSlot,
  ProcessingType,
  Flavor,
} from "@/config/trial.config";

export interface Variable {
  id: string;
  ingredient: string;
  percentage: number;
}

export interface TrialSetup {
  date: string; // ISO string
  processingType: ProcessingType;
  flavor: Flavor;
  variables: Variable[];
  emphasis?: string;
}

export type SensoryMetrics = Record<SensoryMetricKey, number>;
export type SensoryEvaluation = Partial<Record<SensoryCategory, SensoryMetrics>>;
export type PhotoGrid = Partial<Record<PhotoSlot, string>>;

export interface Trial {
  id: string;
  trialNumber: number;
  setup?: TrialSetup;
  sensory: SensoryEvaluation;
  photos: PhotoGrid;
  createdAt: string;
  updatedAt: string;
}

export type CompletionStatus = "done" | "partial" | "not-started";

export interface TrialCompletion {
  setup: CompletionStatus;
  sensory: CompletionStatus;
  photos: CompletionStatus;
  completedSections: number;
  isFullyComplete: boolean;
}
