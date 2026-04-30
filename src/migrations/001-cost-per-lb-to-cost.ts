/**
 * Migration 001 — rename `costPerLb` → `cost` on IngredientRecord
 *
 * Background: the cost field was originally stored as `costPerLb` but is now
 * stored as `cost` (unit-agnostic). This migration reads the existing
 * localStorage snapshot, renames the key on every record that still carries
 * the old name, and writes the result back.
 *
 * Safe to delete this file (and the call-site in main.tsx) once all clients
 * have been updated past this version.
 */

const STORAGE_KEY = "pudds:ingredients";
const MIGRATION_FLAG = "pudds:migration:001-cost-per-lb-to-cost";

export const runMigration001 = (): void => {
  // Only run once per browser profile.
  if (localStorage.getItem(MIGRATION_FLAG)) return;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const records: any[] = JSON.parse(raw);
      const migrated = records.map((r) => {
        if ("costPerLb" in r && !("cost" in r)) {
          const { costPerLb, ...rest } = r;
          return { ...rest, cost: costPerLb };
        }
        return r;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    }
  } catch {
    // Non-fatal — corrupt data will be handled by the normal read path.
  }

  localStorage.setItem(MIGRATION_FLAG, "1");
};
