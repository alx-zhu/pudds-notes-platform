export type StorageTimeUnit = "min" | "hr" | "day";

export interface DecomposedTime {
  value: number;
  unit: StorageTimeUnit;
}

/**
 * Format a duration in minutes into a human-readable string.
 * 0 → "Immediate", 30 → "30 min", 120 → "2 hrs", 1440 → "1 day"
 */
export const formatStorageTime = (minutes: number): string => {
  if (minutes === 0) return "Immediate";
  if (minutes % 1440 === 0) {
    const days = minutes / 1440;
    return days === 1 ? "1 day" : `${days} days`;
  }
  if (minutes % 60 === 0) {
    const hrs = minutes / 60;
    return hrs === 1 ? "1 hr" : `${hrs} hrs`;
  }
  return `${minutes} min`;
};

/** Convert a value + unit into total minutes. */
export const parseToMinutes = (value: number, unit: StorageTimeUnit): number => {
  const multiplier = unit === "day" ? 1440 : unit === "hr" ? 60 : 1;
  return Math.round(value * multiplier);
};

/** Decompose total minutes into the largest clean unit. */
export const decomposeMinutes = (minutes: number): DecomposedTime => {
  if (minutes === 0) return { value: 0, unit: "min" };
  if (minutes % 1440 === 0) return { value: minutes / 1440, unit: "day" };
  if (minutes % 60 === 0) return { value: minutes / 60, unit: "hr" };
  return { value: minutes, unit: "min" };
};
