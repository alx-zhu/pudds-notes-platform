import type {
  Trial,
  TrialRecord,
  TrialSetup,
  AnalysisLog,
  SensoryEvaluation,
  PartialSensoryMetrics,
  PartialSensoryComments,
} from "@/types/trial";
import { simulateApiCall } from "./client";
import { resolveForTrial, removeAllForTrial } from "./trialIngredients";
import { runMigrations } from "./migration";

const STORAGE_KEY = "pudds:trials";

export interface AnalysisLogInput {
  thermalProcessingType: string;
  storageTimeMinutes: number;
  photos?: string[];
}

export interface SensoryEvaluationInput {
  label: string;
  metrics: PartialSensoryMetrics;
  comments?: PartialSensoryComments;
}

/* ── Legacy migration ────────────────────────────────────────────── */

const LEGACY_STORAGE_MAP: Record<string, number> = {
  immediate: 0,
  "24h": 1440,
  "3d": 4320,
};

const LEGACY_THERMAL_MAP: Record<string, string> = {
  thermomix: "Thermomix",
  "pressure-cook": "Pressure Cook",
};

interface LegacyAnalysisLog {
  storageTime?: string;
  storageTimeMinutes?: number;
  thermalProcessingType: string;
  metrics?: PartialSensoryMetrics;
  comments?: PartialSensoryComments;
  evaluations?: SensoryEvaluation[];
}

const migrateTrials = (
  trials: TrialRecord[],
): { trials: TrialRecord[]; migrated: boolean } => {
  let migrated = false;
  const result = trials.map((trial) => ({
    ...trial,
    analysisLogs: trial.analysisLogs.map((log) => {
      let current = log as unknown as Record<string, unknown>;
      const legacy = log as unknown as LegacyAnalysisLog;

      // Legacy storageTime string → storageTimeMinutes number
      if (
        typeof legacy.storageTime === "string" &&
        legacy.storageTimeMinutes === undefined
      ) {
        migrated = true;
        const { storageTime: _legacyField, ...rest } = current;
        current = {
          ...rest,
          thermalProcessingType:
            LEGACY_THERMAL_MAP[legacy.thermalProcessingType] ??
            legacy.thermalProcessingType,
          storageTimeMinutes:
            LEGACY_STORAGE_MAP[legacy.storageTime as string] ?? 0,
        };
      }

      // Legacy top-level metrics/comments → evaluations array
      if (legacy.metrics !== undefined && legacy.evaluations === undefined) {
        migrated = true;
        const hasData = Object.values(legacy.metrics ?? {}).some(
          (v) => v != null,
        );
        const { metrics: _m, comments: _c, ...rest } = current;
        current = {
          ...rest,
          evaluations: hasData
            ? [
                {
                  id: crypto.randomUUID(),
                  label: "Evaluation 1",
                  metrics: legacy.metrics ?? {},
                  comments: legacy.comments ?? {},
                  createdAt:
                    (current.createdAt as string) ?? new Date().toISOString(),
                  updatedAt:
                    (current.updatedAt as string) ?? new Date().toISOString(),
                },
              ]
            : [],
        };
      }

      return current as unknown as AnalysisLog;
    }),
  }));
  return { trials: result, migrated };
};

/* ── Storage helpers ─────────────────────────────────────────────── */

const readStorage = (): TrialRecord[] => {
  try {
    // Run relational migrations before reading
    runMigrations();

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TrialRecord[];
    const { trials, migrated } = migrateTrials(parsed);
    if (migrated) writeStorage(trials);
    return trials;
  } catch {
    return [];
  }
};

const writeStorage = (trials: TrialRecord[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trials));
};

const nextTrialNumber = (trials: TrialRecord[]): number => {
  if (trials.length === 0) return 1;
  return Math.max(...trials.map((t) => t.trialNumber)) + 1;
};

/* ── Resolver: TrialRecord → Trial (with ingredients) ────────────── */

const resolveTrial = (record: TrialRecord): Trial => ({
  ...record,
  ingredients: resolveForTrial(record.id),
});

/* ── CRUD ─────────────────────────────────────────────────────────── */

export const fetchTrials = async (): Promise<Trial[]> => {
  const data = readStorage();
  return simulateApiCall(
    [...data].sort((a, b) => b.trialNumber - a.trialNumber).map(resolveTrial),
  );
};

export const fetchTrial = async (id: string): Promise<Trial> => {
  const data = readStorage();
  const trial = data.find((t) => t.id === id);
  if (!trial) throw new Error(`Trial ${id} not found`);
  return simulateApiCall(resolveTrial(trial));
};

export const createTrial = async (): Promise<Trial> => {
  const data = readStorage();
  const now = new Date().toISOString();
  const record: TrialRecord = {
    id: crypto.randomUUID(),
    trialNumber: nextTrialNumber(data),
    setup: undefined,
    analysisLogs: [],
    createdAt: now,
    updatedAt: now,
  };
  writeStorage([...data, record]);
  return simulateApiCall(resolveTrial(record));
};

export const createTrialWithSetup = async (
  setup: TrialSetup,
  name?: string,
): Promise<Trial> => {
  const data = readStorage();
  const now = new Date().toISOString();
  const record: TrialRecord = {
    id: crypto.randomUUID(),
    trialNumber: nextTrialNumber(data),
    name: name || undefined,
    setup,
    analysisLogs: [],
    createdAt: now,
    updatedAt: now,
  };
  writeStorage([...data, record]);
  return simulateApiCall(resolveTrial(record));
};

export const updateTrialSetup = async (
  id: string,
  setup: TrialSetup,
): Promise<Trial> => {
  const data = readStorage();
  const idx = data.findIndex((t) => t.id === id);
  if (idx === -1) throw new Error(`Trial ${id} not found`);
  const updated: TrialRecord = {
    ...data[idx],
    setup,
    updatedAt: new Date().toISOString(),
  };
  data[idx] = updated;
  writeStorage(data);
  return simulateApiCall(resolveTrial(updated));
};

export const addAnalysisLog = async (
  trialId: string,
  input: AnalysisLogInput,
): Promise<Trial> => {
  const data = readStorage();
  const idx = data.findIndex((t) => t.id === trialId);
  if (idx === -1) throw new Error(`Trial ${trialId} not found`);
  const now = new Date().toISOString();
  const newLog: AnalysisLog = {
    id: crypto.randomUUID(),
    thermalProcessingType: input.thermalProcessingType,
    storageTimeMinutes: input.storageTimeMinutes,
    photos: input.photos,
    evaluations: [],
    createdAt: now,
    updatedAt: now,
  };
  const updated: TrialRecord = {
    ...data[idx],
    analysisLogs: [...data[idx].analysisLogs, newLog],
    updatedAt: now,
  };
  data[idx] = updated;
  writeStorage(data);
  return simulateApiCall(resolveTrial(updated));
};

export const updateAnalysisLog = async (
  trialId: string,
  logId: string,
  input: Partial<AnalysisLogInput>,
): Promise<Trial> => {
  const data = readStorage();
  const idx = data.findIndex((t) => t.id === trialId);
  if (idx === -1) throw new Error(`Trial ${trialId} not found`);
  const now = new Date().toISOString();
  const updated: TrialRecord = {
    ...data[idx],
    analysisLogs: data[idx].analysisLogs.map((log) =>
      log.id === logId ? { ...log, ...input, updatedAt: now } : log,
    ),
    updatedAt: now,
  };
  data[idx] = updated;
  writeStorage(data);
  return simulateApiCall(resolveTrial(updated));
};

export const deleteAnalysisLog = async (
  trialId: string,
  logId: string,
): Promise<Trial> => {
  const data = readStorage();
  const idx = data.findIndex((t) => t.id === trialId);
  if (idx === -1) throw new Error(`Trial ${trialId} not found`);
  const now = new Date().toISOString();
  const updated: TrialRecord = {
    ...data[idx],
    analysisLogs: data[idx].analysisLogs.filter((log) => log.id !== logId),
    updatedAt: now,
  };
  data[idx] = updated;
  writeStorage(data);
  return simulateApiCall(resolveTrial(updated));
};

export const updateTrialName = async (
  id: string,
  name: string | undefined,
): Promise<Trial> => {
  const data = readStorage();
  const idx = data.findIndex((t) => t.id === id);
  if (idx === -1) throw new Error(`Trial ${id} not found`);
  const updated: TrialRecord = {
    ...data[idx],
    name: name || undefined,
    updatedAt: new Date().toISOString(),
  };
  data[idx] = updated;
  writeStorage(data);
  return simulateApiCall(resolveTrial(updated));
};

/* ── Evaluation CRUD ─────────────────────────────────────────────── */

export const addEvaluation = async (
  trialId: string,
  logId: string,
  input: SensoryEvaluationInput,
): Promise<Trial> => {
  const data = readStorage();
  const idx = data.findIndex((t) => t.id === trialId);
  if (idx === -1) throw new Error(`Trial ${trialId} not found`);
  const now = new Date().toISOString();
  const newEval: SensoryEvaluation = {
    id: crypto.randomUUID(),
    ...input,
    createdAt: now,
    updatedAt: now,
  };
  const updated: TrialRecord = {
    ...data[idx],
    analysisLogs: data[idx].analysisLogs.map((log) =>
      log.id === logId
        ? {
            ...log,
            evaluations: [...log.evaluations, newEval],
            updatedAt: now,
          }
        : log,
    ),
    updatedAt: now,
  };
  data[idx] = updated;
  writeStorage(data);
  return simulateApiCall(resolveTrial(updated));
};

export const updateEvaluation = async (
  trialId: string,
  logId: string,
  evalId: string,
  input: Partial<SensoryEvaluationInput>,
): Promise<Trial> => {
  const data = readStorage();
  const idx = data.findIndex((t) => t.id === trialId);
  if (idx === -1) throw new Error(`Trial ${trialId} not found`);
  const now = new Date().toISOString();
  const updated: TrialRecord = {
    ...data[idx],
    analysisLogs: data[idx].analysisLogs.map((log) =>
      log.id === logId
        ? {
            ...log,
            evaluations: log.evaluations.map((ev) =>
              ev.id === evalId ? { ...ev, ...input, updatedAt: now } : ev,
            ),
            updatedAt: now,
          }
        : log,
    ),
    updatedAt: now,
  };
  data[idx] = updated;
  writeStorage(data);
  return simulateApiCall(resolveTrial(updated));
};

export const deleteEvaluation = async (
  trialId: string,
  logId: string,
  evalId: string,
): Promise<Trial> => {
  const data = readStorage();
  const idx = data.findIndex((t) => t.id === trialId);
  if (idx === -1) throw new Error(`Trial ${trialId} not found`);
  const now = new Date().toISOString();
  const updated: TrialRecord = {
    ...data[idx],
    analysisLogs: data[idx].analysisLogs.map((log) =>
      log.id === logId
        ? {
            ...log,
            evaluations: log.evaluations.filter((ev) => ev.id !== evalId),
            updatedAt: now,
          }
        : log,
    ),
    updatedAt: now,
  };
  data[idx] = updated;
  writeStorage(data);
  return simulateApiCall(resolveTrial(updated));
};

export const deleteTrial = async (id: string): Promise<void> => {
  writeStorage(readStorage().filter((t) => t.id !== id));
  removeAllForTrial(id);
  return simulateApiCall(undefined as void);
};
