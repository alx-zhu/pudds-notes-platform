import { SENSORY_METRICS } from "@/config/trial.config";
import type { SensoryCategory } from "@/config/trial.config";
import type { SensoryMetrics } from "@/types/trial";

export function isCategoryDone(
  sensory: Partial<Record<SensoryCategory, SensoryMetrics>>,
  key: SensoryCategory,
): boolean {
  const entry = sensory[key];
  if (!entry) return false;
  return SENSORY_METRICS.every(
    (m) => entry[m.key] != null && entry[m.key] >= 1,
  );
}
