import type { MetricKey } from "@/config/sensoryForms";
import type { ProcessingType, Flavor } from "@/config/trial.config";
import type { TrialIngredient } from "@/types/ingredient";

export interface TrialSetup {
  date: string; // ISO string
  processingType: ProcessingType;
  flavor: Flavor;
  thermalProcessingType: string;
}

export interface PhysicalMeasurements {
  bostwickTime?: number;
  bostwickDistance?: number;
  pH?: number;
  syneresis?: number;
}

export type PartialSensoryMetrics = Partial<Record<MetricKey, number>>;
export type PartialSensoryComments = Partial<Record<MetricKey, string>>;

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
  storageTimeMinutes: number;
  photos?: string[];
  measurements?: PhysicalMeasurements;
  evaluations: SensoryEvaluation[];
  createdAt: string;
  updatedAt: string;
}

export interface ProcessParam {
  key: string;
  value: string;
  unit?: string;
}

export interface ProcessStep {
  id: string;
  order: number;
  name: string;
  timestamp?: string; // HH:MM wall-clock time, e.g. "06:45"
  params: ProcessParam[];
  notes?: string;
}

/* ── Data model (what's in localStorage / DB row) ───────────────── */

export interface FoulingResult {
  didFoul: boolean;
  timeToFoulingMinutes?: number; // present only when didFoul === true
}

export interface TrialRecord {
  id: string;
  trialNumber: number;
  name?: string;
  setup?: TrialSetup;
  analysisLogs: AnalysisLog[];
  processSteps: ProcessStep[];
  fouling?: FoulingResult;
  createdAt: string;
  updatedAt: string;
}

/* ── Frontend (resolved joins — what components consume) ────────── */

export interface Trial extends TrialRecord {
  ingredients: TrialIngredient[];
}

/* ── UI state ────────────────────────────────────────────────────── */

export interface SensoryFormState {
  logId: string;
  logLabel: string;
  evaluation?: SensoryEvaluation;
  onDelete?: () => void;
}
