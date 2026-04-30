import type { IngredientType } from "@/config/ingredient.config";

/* ── Data model types (mirror DB tables) ────────────────────────── */

export interface IngredientRecord {
  id: string;
  name: string;
  abbreviation?: string;
  pinned?: boolean;
  type?: IngredientType;
  solid?: boolean;
  cost?: number;
}

export interface TrialIngredientRecord {
  trialId: string;
  ingredientId: string;
  percentage: number;
  pinned?: boolean;
}

/* ── Frontend types (resolved joins) ────────────────────────────── */

export interface Ingredient {
  id: string;
  name: string;
  abbreviation?: string;
  pinned?: boolean;
  type?: IngredientType;
  solid?: boolean;
  cost?: number;
}

export interface TrialIngredient {
  ingredient: Ingredient;
  percentage: number;
  pinned?: boolean;
}
