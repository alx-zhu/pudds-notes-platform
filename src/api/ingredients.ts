import type { IngredientRecord, Ingredient } from "@/types/ingredient";
import { simulateApiCall } from "./client";

const STORAGE_KEY = "pudds:ingredients";

/* ── Storage helpers ─────────────────────────────────────────────── */

export const readIngredients = (): IngredientRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as IngredientRecord[];
  } catch {
    return [];
  }
};

export const writeIngredients = (records: IngredientRecord[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
};

/* ── Resolvers ───────────────────────────────────────────────────── */

const toIngredient = (record: IngredientRecord): Ingredient => ({
  id: record.id,
  name: record.name,
});

/* ── CRUD (RESTful) ──────────────────────────────────────────────── */

/** GET /ingredients */
export const fetchIngredients = async (): Promise<Ingredient[]> => {
  const records = readIngredients();
  return simulateApiCall(
    records.map(toIngredient).sort((a, b) => a.name.localeCompare(b.name)),
  );
};

/** POST /ingredients */
export const createIngredient = async (name: string): Promise<Ingredient> => {
  const records = readIngredients();
  const record: IngredientRecord = {
    id: crypto.randomUUID(),
    name: name.trim(),
  };
  writeIngredients([...records, record]);
  return simulateApiCall(toIngredient(record));
};

/** PUT /ingredients/:id */
export const updateIngredient = async (
  id: string,
  name: string,
): Promise<Ingredient> => {
  const records = readIngredients();
  const idx = records.findIndex((r) => r.id === id);
  if (idx === -1) throw new Error(`Ingredient ${id} not found`);
  records[idx] = { ...records[idx], name: name.trim() };
  writeIngredients(records);
  return simulateApiCall(toIngredient(records[idx]));
};

/** DELETE /ingredients/:id */
export const deleteIngredient = async (id: string): Promise<void> => {
  writeIngredients(readIngredients().filter((r) => r.id !== id));
  return simulateApiCall(undefined as void);
};
