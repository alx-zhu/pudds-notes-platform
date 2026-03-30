import type {
  TrialIngredientRecord,
  TrialIngredient,
  Ingredient,
} from "@/types/ingredient";
import { readIngredients } from "./ingredients";
import { simulateApiCall } from "./client";

const STORAGE_KEY = "pudds:trial-ingredients";

/* ── Storage helpers ─────────────────────────────────────────────── */

export const readTrialIngredients = (): TrialIngredientRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as TrialIngredientRecord[];
  } catch {
    return [];
  }
};

export const writeTrialIngredients = (
  records: TrialIngredientRecord[],
): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
};

/* ── Resolver (joins TrialIngredientRecord[] with Ingredient[]) ── */

export const resolveTrialIngredients = (
  records: TrialIngredientRecord[],
): TrialIngredient[] => {
  const ingredients = readIngredients();
  const ingredientMap = new Map<string, Ingredient>(
    ingredients.map((i) => [i.id, i]),
  );

  return records
    .map((record) => {
      const ingredient = ingredientMap.get(record.ingredientId);
      if (!ingredient) return null;
      return {
        ingredient,
        percentage: record.percentage,
        ...(record.pinned != null && { pinned: record.pinned }),
      } satisfies TrialIngredient;
    })
    .filter((ti): ti is TrialIngredient => ti !== null);
};

/** Returns resolved TrialIngredient[] for a given trial */
export const resolveForTrial = (trialId: string): TrialIngredient[] => {
  const all = readTrialIngredients();
  return resolveTrialIngredients(all.filter((r) => r.trialId === trialId));
};

/* ── Input types ─────────────────────────────────────────────────── */

export interface AddTrialIngredientInput {
  ingredientId: string;
  percentage: number;
  pinned?: boolean;
}

export interface UpdateTrialIngredientInput {
  percentage?: number;
  pinned?: boolean;
}

/* ── CRUD (RESTful sub-resource) ─────────────────────────────────── */

/** GET /trials/:trialId/ingredients */
export const fetchTrialIngredients = async (
  trialId: string,
): Promise<TrialIngredient[]> => {
  return simulateApiCall(resolveForTrial(trialId));
};

/** POST /trials/:trialId/ingredients */
export const addTrialIngredient = async (
  trialId: string,
  input: AddTrialIngredientInput,
): Promise<TrialIngredient> => {
  const all = readTrialIngredients();

  const exists = all.some(
    (r) => r.trialId === trialId && r.ingredientId === input.ingredientId,
  );
  if (exists) {
    throw new Error(
      `Ingredient ${input.ingredientId} already exists on trial ${trialId}`,
    );
  }

  const record: TrialIngredientRecord = {
    trialId,
    ingredientId: input.ingredientId,
    percentage: input.percentage,
    ...(input.pinned != null && { pinned: input.pinned }),
  };
  writeTrialIngredients([...all, record]);

  const resolved = resolveTrialIngredients([record]);
  if (resolved.length === 0) {
    throw new Error(`Ingredient ${input.ingredientId} not found`);
  }
  return simulateApiCall(resolved[0]);
};

/** PATCH /trials/:trialId/ingredients/:ingredientId */
export const updateTrialIngredient = async (
  trialId: string,
  ingredientId: string,
  input: UpdateTrialIngredientInput,
): Promise<TrialIngredient> => {
  const all = readTrialIngredients();
  const idx = all.findIndex(
    (r) => r.trialId === trialId && r.ingredientId === ingredientId,
  );
  if (idx === -1) {
    throw new Error(
      `Trial ingredient not found: trial=${trialId}, ingredient=${ingredientId}`,
    );
  }

  all[idx] = { ...all[idx], ...input };
  writeTrialIngredients(all);

  const resolved = resolveTrialIngredients([all[idx]]);
  return simulateApiCall(resolved[0]);
};

/** DELETE /trials/:trialId/ingredients/:ingredientId */
export const removeTrialIngredient = async (
  trialId: string,
  ingredientId: string,
): Promise<void> => {
  writeTrialIngredients(
    readTrialIngredients().filter(
      (r) => !(r.trialId === trialId && r.ingredientId === ingredientId),
    ),
  );
  return simulateApiCall(undefined as void);
};

/** Remove all trial-ingredient links for a given trial (used on trial delete) */
export const removeAllForTrial = (trialId: string): void => {
  writeTrialIngredients(
    readTrialIngredients().filter((r) => r.trialId !== trialId),
  );
};
