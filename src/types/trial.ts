import type {
  SensoryMetricKey,
  ThermalProcessingType,
  StorageTime,
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
}

export type PartialSensoryMetrics = Partial<Record<SensoryMetricKey, number>>;
export type PartialSensoryComments = Partial<Record<SensoryMetricKey, string>>;

export interface AnalysisLog {
  id: string;
  thermalProcessingType: ThermalProcessingType;
  storageTime: StorageTime;
  photos?: string[];
  metrics: PartialSensoryMetrics;
  comments?: PartialSensoryComments;
  createdAt: string;
  updatedAt: string;
}

export interface Trial {
  id: string;
  trialNumber: number;
  name?: string;
  setup?: TrialSetup;
  analysisLogs: AnalysisLog[];
  createdAt: string;
  updatedAt: string;
}

export type CompletionStatus = "done" | "partial" | "not-started";

export interface TrialCompletion {
  setup: CompletionStatus;
  analysisLogs: CompletionStatus;
  completedSections: number;
  isFullyComplete: boolean;
}
