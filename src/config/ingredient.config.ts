/**
 * Centralized domain configuration for ingredients.
 * All constants and derived types are defined here.
 * Components must import from this file — no hardcoded values.
 */

export const INGREDIENT_TYPES = [
  { value: "protein", label: "Protein", style: "bg-blue-100 text-blue-800" },
  { value: "water-base", label: "Water / Base", style: "bg-sky-100 text-sky-800" },
  { value: "texture", label: "Texture", style: "bg-amber-100 text-amber-800" },
  { value: "sweetener", label: "Sweetener", style: "bg-pink-100 text-pink-800" },
  { value: "flavor", label: "Flavor", style: "bg-violet-100 text-violet-800" },
  { value: "other", label: "Other", style: "bg-gray-100 text-gray-700" },
] as const;

export type IngredientType = (typeof INGREDIENT_TYPES)[number]["value"];

export const INGREDIENT_TYPE_MAP = Object.fromEntries(
  INGREDIENT_TYPES.map((t) => [t.value, t]),
) as Record<IngredientType, (typeof INGREDIENT_TYPES)[number]>;

export const BADGE_BASE = "px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap";
