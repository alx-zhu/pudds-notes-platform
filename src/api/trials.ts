import type { Trial, TrialSetup, SensoryMetrics, PhotoGrid } from "@/types/trial";
import type { SensoryCategory } from "@/config/trial.config";
import { simulateApiCall } from "./client";

const STORAGE_KEY = "pudds:trials";

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
    sensory: {},
    photos: {},
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
    sensory: {},
    photos: {},
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

export async function updateSensoryCategory(
  id: string,
  category: SensoryCategory,
  metrics: SensoryMetrics,
): Promise<Trial> {
  const data = readStorage();
  const idx = data.findIndex((t) => t.id === id);
  if (idx === -1) throw new Error(`Trial ${id} not found`);
  const updated: Trial = {
    ...data[idx],
    sensory: { ...data[idx].sensory, [category]: metrics },
    updatedAt: new Date().toISOString(),
  };
  data[idx] = updated;
  writeStorage(data);
  return simulateApiCall(updated);
}

export async function updatePhotoGrid(
  id: string,
  photos: PhotoGrid,
): Promise<Trial> {
  const data = readStorage();
  const idx = data.findIndex((t) => t.id === id);
  if (idx === -1) throw new Error(`Trial ${id} not found`);
  const updated: Trial = {
    ...data[idx],
    photos,
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
