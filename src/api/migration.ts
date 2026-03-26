import type { IngredientRecord, TrialIngredientRecord } from "@/types/ingredient";
import { readIngredients, writeIngredients } from "./ingredients";
import {
  readTrialIngredients,
  writeTrialIngredients,
} from "./trialIngredients";

const MIGRATION_KEY = "pudds:migration-version";
const TRIALS_KEY = "pudds:trials";

/** Legacy Variable shape from pre-migration data */
interface LegacyVariable {
  id: string;
  ingredient: string;
  percentage: number;
}

interface LegacySetup {
  date: string;
  processingType: string;
  flavor: string;
  variables?: LegacyVariable[];
}

interface LegacyTrial {
  id: string;
  setup?: LegacySetup;
  [key: string]: unknown;
}

/**
 * Migrates legacy Variable[] data (ingredient strings embedded in trial setup)
 * into the new relational model:
 *   - Unique ingredient names → IngredientRecord[] in `pudds:ingredients`
 *   - Trial-ingredient links → TrialIngredientRecord[] in `pudds:trial-ingredients`
 *   - Strips `variables` from trial setup objects in `pudds:trials`
 *
 * Gated by `pudds:migration-version`. Runs once.
 */
export const runMigrations = (): void => {
  const currentVersion = Number(localStorage.getItem(MIGRATION_KEY) ?? "1");
  if (currentVersion >= 2) return;

  migrateIngredientsV2();
  localStorage.setItem(MIGRATION_KEY, "2");
};

const migrateIngredientsV2 = (): void => {
  const raw = localStorage.getItem(TRIALS_KEY);
  if (!raw) return;

  let trials: LegacyTrial[];
  try {
    trials = JSON.parse(raw) as LegacyTrial[];
  } catch {
    return;
  }

  // Collect existing ingredients/trial-ingredients to avoid duplicates
  const existingIngredients = readIngredients();
  const existingTrialIngredients = readTrialIngredients();

  // Build name → IngredientRecord map, seeding with any existing records
  const ingredientsByName = new Map<string, IngredientRecord>(
    existingIngredients.map((i) => [i.name.toLowerCase(), i]),
  );

  const newTrialIngredients: TrialIngredientRecord[] = [
    ...existingTrialIngredients,
  ];

  let trialsModified = false;

  for (const trial of trials) {
    const variables = trial.setup?.variables;
    if (!variables || variables.length === 0) continue;

    for (const v of variables) {
      const name = v.ingredient.trim();
      if (!name) continue;

      // Find or create the ingredient
      let ingredient = ingredientsByName.get(name.toLowerCase());
      if (!ingredient) {
        ingredient = { id: crypto.randomUUID(), name };
        ingredientsByName.set(name.toLowerCase(), ingredient);
      }

      // Create the trial-ingredient link
      newTrialIngredients.push({
        trialId: trial.id,
        ingredientId: ingredient.id,
        percentage: v.percentage,
      });
    }

    // Strip variables from setup
    delete trial.setup!.variables;
    trialsModified = true;
  }

  // Write all three stores
  writeIngredients([...ingredientsByName.values()]);
  writeTrialIngredients(newTrialIngredients);

  if (trialsModified) {
    localStorage.setItem(TRIALS_KEY, JSON.stringify(trials));
  }
};
