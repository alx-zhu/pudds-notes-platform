import { THERMAL_PROCESSING_TYPES, STORAGE_TIMES } from "@/config/trial.config";
import type { AnalysisLog } from "@/types/trial";

export const getLogLabel = (log: AnalysisLog): string => {
  const thermal =
    THERMAL_PROCESSING_TYPES.find((t) => t.value === log.thermalProcessingType)
      ?.label ?? log.thermalProcessingType;
  const storage =
    STORAGE_TIMES.find((s) => s.value === log.storageTime)?.label ??
    log.storageTime;
  return `${thermal} · ${storage}`;
};
