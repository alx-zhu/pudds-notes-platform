import type { Trial, TrialSetup, AnalysisLog, PartialSensoryMetrics } from "@/types/trial";
import type { ThermalProcessingType, StorageTime } from "@/config/trial.config";
import { simulateApiCall } from "./client";

const STORAGE_KEY = "pudds:trials";

export interface AnalysisLogInput {
  thermalProcessingType: ThermalProcessingType;
  storageTime: StorageTime;
  photo?: string;
  metrics: PartialSensoryMetrics;
}

function readStorage(): Trial[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Trial[]) : [];
  } catch {
    return [];
  }
}

function writeStorage(trials: Trial[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trials));
}

function nextTrialNumber(trials: Trial[]): number {
  if (trials.length === 0) return 1;
  return Math.max(...trials.map((t) => t.trialNumber)) + 1;
}

export async function fetchTrials(): Promise<Trial[]> {
  const data = readStorage();
  return simulateApiCall(
    [...data].sort((a, b) => b.trialNumber - a.trialNumber),
  );
}

export async function fetchTrial(id: string): Promise<Trial> {
  const data = readStorage();
  const trial = data.find((t) => t.id === id);
  if (!trial) throw new Error(`Trial ${id} not found`);
  return simulateApiCall(trial);
}

export async function createTrial(): Promise<Trial> {
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
}

export async function createTrialWithSetup(setup: TrialSetup): Promise<Trial> {
  const data = readStorage();
  const now = new Date().toISOString();
  const trial: Trial = {
    id: crypto.randomUUID(),
    trialNumber: nextTrialNumber(data),
    setup,
    analysisLogs: [],
    createdAt: now,
    updatedAt: now,
  };
  writeStorage([...data, trial]);
  return simulateApiCall(trial);
}

export async function updateTrialSetup(
  id: string,
  setup: TrialSetup,
): Promise<Trial> {
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
}

export async function addAnalysisLog(
  trialId: string,
  input: AnalysisLogInput,
): Promise<Trial> {
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
}

export async function updateAnalysisLog(
  trialId: string,
  logId: string,
  input: Partial<AnalysisLogInput>,
): Promise<Trial> {
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
}

export async function deleteAnalysisLog(
  trialId: string,
  logId: string,
): Promise<Trial> {
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
}

export async function updateTrialName(
  id: string,
  name: string | undefined,
): Promise<Trial> {
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
}

export async function deleteTrial(id: string): Promise<void> {
  writeStorage(readStorage().filter((t) => t.id !== id));
  return simulateApiCall(undefined as void);
}
