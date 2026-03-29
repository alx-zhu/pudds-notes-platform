import type {
  SensoryMetricKey,
  ProcessingType,
  Flavor,
} from "@/config/trial.config";
import type { TrialIngredient } from "@/types/ingredient";

export interface TrialSetup {
  date: string; // ISO string
  processingType: ProcessingType;
  flavor: Flavor;
}

export type EvalView = "all" | string;

export type PartialSensoryMetrics = Partial<Record<SensoryMetricKey, number>>;
export type PartialSensoryComments = Partial<Record<SensoryMetricKey, string>>;

export interface SensoryEvaluation {
  id: string;
  label: string;
  metrics: PartialSensoryMetrics;
  comments?: PartialSensoryComments;
  createdAt: string;
  updatedAt: string;
}

export interface AnalysisLog {
  id: string;
  thermalProcessingType: string;
  storageTimeMinutes: number;
  photos?: string[];
  evaluations: SensoryEvaluation[];
  createdAt: string;
  updatedAt: string;
}

/* ── Data model (what's in localStorage / DB row) ───────────────── */

export interface TrialRecord {
  id: string;
  trialNumber: number;
  name?: string;
  setup?: TrialSetup;
  analysisLogs: AnalysisLog[];
  createdAt: string;
  updatedAt: string;
}

/* ── Frontend (resolved joins — what components consume) ────────── */

export interface Trial extends TrialRecord {
  ingredients: TrialIngredient[];
}
