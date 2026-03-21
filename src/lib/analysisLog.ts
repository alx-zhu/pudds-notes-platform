import { formatStorageTime } from "./storageTime";
import type { AnalysisLog } from "@/types/trial";

export const getLogLabel = (log: AnalysisLog): string => {
  const storage = formatStorageTime(log.storageTimeMinutes);
  return `${log.thermalProcessingType} · ${storage}`;
};

/**
 * Sort logs by thermal processing type (alphabetical) then by storage time
 * (descending — longest time first).
 */
export const sortLogs = (logs: AnalysisLog[]): AnalysisLog[] =>
  [...logs].sort((a, b) => {
    const typeCmp = a.thermalProcessingType.localeCompare(b.thermalProcessingType);
    if (typeCmp !== 0) return typeCmp;
    return b.storageTimeMinutes - a.storageTimeMinutes;
  });
