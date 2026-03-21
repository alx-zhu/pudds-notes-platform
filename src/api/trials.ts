import type { Trial, TrialSetup, AnalysisLog, PartialSensoryMetrics, PartialSensoryComments } from "@/types/trial";
import { simulateApiCall } from "./client";

const STORAGE_KEY = "pudds:trials";

export interface AnalysisLogInput {
  thermalProcessingType: string;
  storageTimeMinutes: number;
  photos?: string[];
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
}

const migrateTrials = (trials: Trial[]): { trials: Trial[]; migrated: boolean } => {
  let migrated = false;
  const result = trials.map((trial) => ({
    ...trial,
    analysisLogs: trial.analysisLogs.map((log) => {
      const legacy = log as unknown as LegacyAnalysisLog;
      if (typeof legacy.storageTime === "string" && legacy.storageTimeMinutes === undefined) {
        migrated = true;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { storageTime: _legacyField, ...rest } = log as unknown as Record<string, unknown>;
        return {
          ...rest,
          thermalProcessingType:
            LEGACY_THERMAL_MAP[legacy.thermalProcessingType] ?? legacy.thermalProcessingType,
          storageTimeMinutes: LEGACY_STORAGE_MAP[legacy.storageTime as string] ?? 0,
        } as unknown as AnalysisLog;
      }
      return log;
    }),
  }));
  return { trials: result, migrated };
};

/* ── Storage helpers ─────────────────────────────────────────────── */

const readStorage = (): Trial[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Trial[];
    const { trials, migrated } = migrateTrials(parsed);
    if (migrated) writeStorage(trials);
    return trials;
  } catch {
    return [];
  }
};

const writeStorage = (trials: Trial[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trials));
};

const nextTrialNumber = (trials: Trial[]): number => {
  if (trials.length === 0) return 1;
  return Math.max(...trials.map((t) => t.trialNumber)) + 1;
};

export const fetchTrials = async (): Promise<Trial[]> => {
  const data = readStorage();
  return simulateApiCall(
    [...data].sort((a, b) => b.trialNumber - a.trialNumber),
  );
};

export const fetchTrial = async (id: string): Promise<Trial> => {
  const data = readStorage();
  const trial = data.find((t) => t.id === id);
  if (!trial) throw new Error(`Trial ${id} not found`);
  return simulateApiCall(trial);
};

export const createTrial = async (): Promise<Trial> => {
  const data = readStorage();
  const now = new Date().toISOString();
  const trial: Trial = {
    id: crypto.randomUUID(),
    trialNumber: nextTrialNumber(data),
    setup: undefined,
    analysisLogs: [],
    createdAt: now,
    updatedAt: now,
  };
  writeStorage([...data, trial]);
  return simulateApiCall(trial);
};

export const createTrialWithSetup = async (
  setup: TrialSetup,
  name?: string,
): Promise<Trial> => {
  const data = readStorage();
  const now = new Date().toISOString();
  const trial: Trial = {
    id: crypto.randomUUID(),
    trialNumber: nextTrialNumber(data),
    name: name || undefined,
    setup,
    analysisLogs: [],
    createdAt: now,
    updatedAt: now,
  };
  writeStorage([...data, trial]);
  return simulateApiCall(trial);
};

export const updateTrialSetup = async (
  id: string,
  setup: TrialSetup,
): Promise<Trial> => {
  const data = readStorage();
  const idx = data.findIndex((t) => t.id === id);
  if (idx === -1) throw new Error(`Trial ${id} not found`);
  const updated: Trial = {
    ...data[idx],
    setup,
    updatedAt: new Date().toISOString(),
  };
  data[idx] = updated;
  writeStorage(data);
  return simulateApiCall(updated);
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
    ...input,
    createdAt: now,
    updatedAt: now,
  };
  const updated: Trial = {
    ...data[idx],
    analysisLogs: [...data[idx].analysisLogs, newLog],
    updatedAt: now,
  };
  data[idx] = updated;
  writeStorage(data);
  return simulateApiCall(updated);
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
  const updated: Trial = {
    ...data[idx],
    analysisLogs: data[idx].analysisLogs.map((log) =>
      log.id === logId ? { ...log, ...input, updatedAt: now } : log,
    ),
    updatedAt: now,
  };
  data[idx] = updated;
  writeStorage(data);
  return simulateApiCall(updated);
};

export const deleteAnalysisLog = async (
  trialId: string,
  logId: string,
): Promise<Trial> => {
  const data = readStorage();
  const idx = data.findIndex((t) => t.id === trialId);
  if (idx === -1) throw new Error(`Trial ${trialId} not found`);
  const now = new Date().toISOString();
  const updated: Trial = {
    ...data[idx],
    analysisLogs: data[idx].analysisLogs.filter((log) => log.id !== logId),
    updatedAt: now,
  };
  data[idx] = updated;
  writeStorage(data);
  return simulateApiCall(updated);
};

export const updateTrialName = async (
  id: string,
  name: string | undefined,
): Promise<Trial> => {
  const data = readStorage();
  const idx = data.findIndex((t) => t.id === id);
  if (idx === -1) throw new Error(`Trial ${id} not found`);
  const updated: Trial = {
    ...data[idx],
    name: name || undefined,
    updatedAt: new Date().toISOString(),
  };
  data[idx] = updated;
  writeStorage(data);
  return simulateApiCall(updated);
};

export const deleteTrial = async (id: string): Promise<void> => {
  writeStorage(readStorage().filter((t) => t.id !== id));
  return simulateApiCall(undefined as void);
};
