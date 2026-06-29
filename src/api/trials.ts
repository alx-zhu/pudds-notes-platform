import type {
  Trial,
  TrialRecord,
  TrialSetup,
  AnalysisLog,
  SensoryEvaluation,
  PartialSensoryMetrics,
  PartialSensoryComments,
  PhysicalMeasurements,
  ProcessStep,
  FoulingResult,
  TrialVisibility,
  Observation,
} from "@/types/trial";
import type { MediaRef } from "@/types/media";
import { simulateApiCall } from "./client";
import { resolveForTrial, removeAllForTrial } from "./trialIngredients";
import { runMigrations } from "./migration";
import { deleteTrialMedia } from "@/lib/storage";

const STORAGE_KEY = "pudds:trials";

export interface AnalysisLogInput {
  storageTimeMinutes: number;
  photos?: string[];
}

export interface SensoryEvaluationInput {
  label: string;
  metrics: PartialSensoryMetrics;
  comments?: PartialSensoryComments;
}

export interface ObservationInput {
  /** Present = edit existing observation; absent = create new. */
  id?: string;
  caption?: string;
  media: MediaRef[];
}

const collectObservationMediaPaths = (record: TrialRecord): string[] =>
  (record.observations ?? []).flatMap((o) => o.media.map((m) => m.path));

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
  thermalProcessingType?: string;
  metrics?: PartialSensoryMetrics;
  comments?: PartialSensoryComments;
  evaluations?: SensoryEvaluation[];
}

const migrateTrials = (
  trials: TrialRecord[],
): { trials: TrialRecord[]; migrated: boolean } => {
  let migrated = false;
  const result = trials.map((trial) => {
    let current = trial as unknown as Record<string, unknown>;

    // Backfill processSteps for records created before this feature
    if ((trial as unknown as Record<string, unknown>).processSteps === undefined) {
      migrated = true;
      current = { ...current, processSteps: [] };
    }

    // Backfill visibility for records created before the privacy feature.
    // Default to private — these are existing trials we must protect.
    if ((trial as unknown as Record<string, unknown>).visibility === undefined) {
      migrated = true;
      current = { ...current, visibility: "private" };
    }

    // Migrate thermalProcessingType from logs to setup
    const setupAny = trial.setup as (TrialSetup & { thermalProcessingType?: string }) | undefined;
    if (trial.setup && !setupAny?.thermalProcessingType) {
      migrated = true;
      const rawThermal = trial.analysisLogs
        .map((l) => (l as unknown as Record<string, unknown>).thermalProcessingType as string | undefined)
        .filter((t): t is string => !!t?.trim())[0];
      const thermalFromLogs = rawThermal
        ? (LEGACY_THERMAL_MAP[rawThermal] ?? rawThermal)
        : "Unspecified";
      current = {
        ...current,
        setup: { ...trial.setup, thermalProcessingType: thermalFromLogs },
      };
    }

    return {
      ...(current as unknown as TrialRecord),
      analysisLogs: trial.analysisLogs.map((log) => {
        let logCurrent = log as unknown as Record<string, unknown>;
        const legacy = log as unknown as LegacyAnalysisLog;

        // Legacy storageTime string → storageTimeMinutes number
        if (
          typeof legacy.storageTime === "string" &&
          legacy.storageTimeMinutes === undefined
        ) {
          migrated = true;
          const { storageTime: _legacyField, ...rest } = logCurrent;
          logCurrent = {
            ...rest,
            storageTimeMinutes:
              LEGACY_STORAGE_MAP[legacy.storageTime as string] ?? 0,
          };
          // Capture thermal for setup migration before stripping
          if (legacy.thermalProcessingType) {
            const mapped =
              LEGACY_THERMAL_MAP[legacy.thermalProcessingType] ??
              legacy.thermalProcessingType;
            logCurrent = { ...logCurrent, thermalProcessingType: mapped };
          }
        }

        // Legacy top-level metrics/comments → evaluations array
        if (legacy.metrics !== undefined && legacy.evaluations === undefined) {
          migrated = true;
          const hasData = Object.values(legacy.metrics ?? {}).some(
            (v) => v != null,
          );
          const { metrics: _m, comments: _c, ...rest } = logCurrent;
          logCurrent = {
            ...rest,
            evaluations: hasData
              ? [
                  {
                    id: crypto.randomUUID(),
                    label: "Evaluation 1",
                    metrics: legacy.metrics ?? {},
                    comments: legacy.comments ?? {},
                    createdAt:
                      (logCurrent.createdAt as string) ?? new Date().toISOString(),
                    updatedAt:
                      (logCurrent.updatedAt as string) ?? new Date().toISOString(),
                  },
                ]
              : [],
          };
        }

        // Strip thermalProcessingType from logs (moved to setup)
        if ("thermalProcessingType" in logCurrent) {
          migrated = true;
          const { thermalProcessingType: _t, ...rest } = logCurrent;
          logCurrent = rest;
        }

        return logCurrent as unknown as AnalysisLog;
      }),
    };
  });
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
    [...data]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .map(resolveTrial),
  );
};

export const fetchTrial = async (id: string): Promise<Trial> => {
  const data = readStorage();
  const trial = data.find((t) => t.id === id);
  if (!trial) throw new Error(`Trial ${id} not found`);
  return simulateApiCall(resolveTrial(trial));
};

export const createTrial = async (
  visibility: TrialVisibility = "public",
): Promise<Trial> => {
  const data = readStorage();
  const now = new Date().toISOString();
  const record: TrialRecord = {
    id: crypto.randomUUID(),
    trialNumber: nextTrialNumber(data),
    setup: undefined,
    analysisLogs: [],
    processSteps: [],
    visibility,
    createdAt: now,
    updatedAt: now,
  };
  writeStorage([...data, record]);
  return simulateApiCall(resolveTrial(record));
};

export const createTrialWithSetup = async (
  setup: TrialSetup,
  name?: string,
  visibility: TrialVisibility = "public",
): Promise<Trial> => {
  const data = readStorage();
  const now = new Date().toISOString();
  const record: TrialRecord = {
    id: crypto.randomUUID(),
    trialNumber: nextTrialNumber(data),
    name: name || undefined,
    setup,
    analysisLogs: [],
    processSteps: [],
    visibility,
    createdAt: now,
    updatedAt: now,
  };
  writeStorage([...data, record]);
  return simulateApiCall(resolveTrial(record));
};

export const updateTrialSetup = async (
  id: string,
  setup: TrialSetup,
  visibility?: TrialVisibility,
): Promise<Trial> => {
  const data = readStorage();
  const idx = data.findIndex((t) => t.id === id);
  if (idx === -1) throw new Error(`Trial ${id} not found`);
  const updated: TrialRecord = {
    ...data[idx],
    setup,
    ...(visibility != null && { visibility }),
    updatedAt: new Date().toISOString(),
  };
  data[idx] = updated;
  writeStorage(data);
  return simulateApiCall(resolveTrial(updated));
};

export const upsertProcessSteps = async (
  trialId: string,
  steps: ProcessStep[],
): Promise<Trial> => {
  const data = readStorage();
  const idx = data.findIndex((t) => t.id === trialId);
  if (idx === -1) throw new Error(`Trial ${trialId} not found`);
  const updated: TrialRecord = {
    ...data[idx],
    processSteps: steps,
    updatedAt: new Date().toISOString(),
  };
  data[idx] = updated;
  writeStorage(data);
  return simulateApiCall(resolveTrial(updated));
};

export const upsertFouling = async (
  trialId: string,
  fouling: FoulingResult | undefined,
): Promise<Trial> => {
  const data = readStorage();
  const idx = data.findIndex((t) => t.id === trialId);
  if (idx === -1) throw new Error(`Trial ${trialId} not found`);
  const updated: TrialRecord = {
    ...data[idx],
    fouling,
    updatedAt: new Date().toISOString(),
  };
  data[idx] = updated;
  writeStorage(data);
  return simulateApiCall(resolveTrial(updated));
};

/* ── Observations ────────────────────────────────────────────────── */

export const upsertObservation = async (
  trialId: string,
  input: ObservationInput,
): Promise<Trial> => {
  const data = readStorage();
  const idx = data.findIndex((t) => t.id === trialId);
  if (idx === -1) throw new Error(`Trial ${trialId} not found`);
  const now = new Date().toISOString();
  const existing = data[idx].observations ?? [];
  const caption = input.caption?.trim() || undefined;
  const observations: Observation[] = input.id
    ? existing.map((o) =>
        o.id === input.id
          ? { ...o, caption, media: input.media, updatedAt: now }
          : o,
      )
    : [
        ...existing,
        {
          id: crypto.randomUUID(),
          caption,
          media: input.media,
          createdAt: now,
          updatedAt: now,
        },
      ];
  const updated: TrialRecord = { ...data[idx], observations, updatedAt: now };
  data[idx] = updated;
  writeStorage(data);
  return simulateApiCall(resolveTrial(updated));
};

export const deleteObservation = async (
  trialId: string,
  observationId: string,
): Promise<Trial> => {
  const data = readStorage();
  const idx = data.findIndex((t) => t.id === trialId);
  if (idx === -1) throw new Error(`Trial ${trialId} not found`);
  const now = new Date().toISOString();
  const removed = (data[idx].observations ?? []).find(
    (o) => o.id === observationId,
  );
  const updated: TrialRecord = {
    ...data[idx],
    observations: (data[idx].observations ?? []).filter(
      (o) => o.id !== observationId,
    ),
    updatedAt: now,
  };
  data[idx] = updated;
  // Persist-then-delete (best-effort): a failed storage delete leaves a
  // harmless orphan; the reverse could leave a broken reference.
  writeStorage(data);
  if (removed?.media.length) {
    try {
      await deleteTrialMedia(removed.media.map((m) => m.path));
    } catch {
      /* orphaned storage object — storage cost only, no broken reference */
    }
  }
  return simulateApiCall(resolveTrial(updated));
};

export const upsertMeasurements = async (
  trialId: string,
  logId: string,
  measurements: PhysicalMeasurements,
): Promise<Trial> => {
  const data = readStorage();
  const idx = data.findIndex((t) => t.id === trialId);
  if (idx === -1) throw new Error(`Trial ${trialId} not found`);
  const now = new Date().toISOString();
  // Persist undefined (not an empty object) when no values were entered, so the
  // log reads as "no measurements" rather than "has an empty record".
  const hasAny = Object.values(measurements).some((v) => v != null);
  const normalized = hasAny ? measurements : undefined;
  const updated: TrialRecord = {
    ...data[idx],
    analysisLogs: data[idx].analysisLogs.map((log) =>
      log.id === logId ? { ...log, measurements: normalized, updatedAt: now } : log,
    ),
    updatedAt: now,
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
  const data = readStorage();
  const target = data.find((t) => t.id === id);
  const mediaPaths = target ? collectObservationMediaPaths(target) : [];
  writeStorage(data.filter((t) => t.id !== id));
  removeAllForTrial(id);
  // Best-effort media cleanup after the record is gone (orphans are harmless).
  if (mediaPaths.length) {
    try {
      await deleteTrialMedia(mediaPaths);
    } catch {
      /* orphaned storage objects — storage cost only */
    }
  }
  return simulateApiCall(undefined as void);
};
