import type { IngredientType } from "@/config/ingredient.config";

export interface IngredientFilters {
  type: IngredientType | null;
  solid: boolean | null;
}

export type IngredientSortField = "name" | "cost" | "avgScore" | "trials";
export type SortDir = "asc" | "desc";

export interface IngredientSort {
  field: IngredientSortField;
  dir: SortDir;
}

export const EMPTY_INGREDIENT_FILTERS: IngredientFilters = {
  type: null,
  solid: null,
};

export const DEFAULT_INGREDIENT_SORT: IngredientSort = {
  field: "name",
  dir: "asc",
};

export const INGREDIENT_SORT_OPTIONS: {
  value: IngredientSortField;
  label: string;
}[] = [
  { value: "name", label: "Name" },
  { value: "cost", label: "Cost" },
  { value: "avgScore", label: "Avg Score" },
  { value: "trials", label: "# Trials" },
];
