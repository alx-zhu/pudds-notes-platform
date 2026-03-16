import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PROCESSING_TYPES,
  FLAVORS,
  THERMAL_PROCESSING_TYPES,
  STORAGE_TIMES,
  SENSORY_METRICS,
} from "@/config/trial.config";
import type { SensoryMetricKey } from "@/config/trial.config";
import { EMPTY_FILTERS, type TrialFilters } from "@/types/filters";
import { format, parseISO } from "date-fns";

interface ActiveFiltersBarProps {
  filters: TrialFilters;
  onFiltersChange: (filters: TrialFilters) => void;
}

interface Chip {
  key: string;
  label: string;
  onRemove: () => void;
}

export const ActiveFiltersBar = ({
  filters,
  onFiltersChange,
}: ActiveFiltersBarProps) => {
  const chips: Chip[] = [];

  const lookupLabel = (
    list: readonly { value: string; label: string }[],
    value: string,
  ) => list.find((item) => item.value === value)?.label ?? value;

  // Processing Types
  for (const val of filters.processingTypes) {
    chips.push({
      key: `pt-${val}`,
      label: `Processing: ${lookupLabel(PROCESSING_TYPES, val)}`,
      onRemove: () =>
        onFiltersChange({
          ...filters,
          processingTypes: filters.processingTypes.filter((v) => v !== val),
        }),
    });
  }

  // Flavors
  for (const val of filters.flavors) {
    chips.push({
      key: `fl-${val}`,
      label: `Flavor: ${lookupLabel(FLAVORS, val)}`,
      onRemove: () =>
        onFiltersChange({
          ...filters,
          flavors: filters.flavors.filter((v) => v !== val),
        }),
    });
  }

  // Thermal Processing Types
  for (const val of filters.thermalProcessingTypes) {
    chips.push({
      key: `tp-${val}`,
      label: `Thermal: ${lookupLabel(THERMAL_PROCESSING_TYPES, val)}`,
      onRemove: () =>
        onFiltersChange({
          ...filters,
          thermalProcessingTypes: filters.thermalProcessingTypes.filter(
            (v) => v !== val,
          ),
        }),
    });
  }

  // Storage Times
  for (const val of filters.storageTimes) {
    chips.push({
      key: `st-${val}`,
      label: `Storage: ${lookupLabel(STORAGE_TIMES, val)}`,
      onRemove: () =>
        onFiltersChange({
          ...filters,
          storageTimes: filters.storageTimes.filter((v) => v !== val),
        }),
    });
  }

  // Ingredients
  for (const val of filters.ingredients) {
    chips.push({
      key: `ing-${val}`,
      label: `Ingredient: ${val}`,
      onRemove: () =>
        onFiltersChange({
          ...filters,
          ingredients: filters.ingredients.filter((v) => v !== val),
        }),
    });
  }

  // Date range
  if (filters.dateRange.from) {
    chips.push({
      key: "date-from",
      label: `From: ${format(parseISO(filters.dateRange.from), "MMM d, yyyy")}`,
      onRemove: () =>
        onFiltersChange({
          ...filters,
          dateRange: { ...filters.dateRange, from: null },
        }),
    });
  }
  if (filters.dateRange.to) {
    chips.push({
      key: "date-to",
      label: `To: ${format(parseISO(filters.dateRange.to), "MMM d, yyyy")}`,
      onRemove: () =>
        onFiltersChange({
          ...filters,
          dateRange: { ...filters.dateRange, to: null },
        }),
    });
  }

  // Sensory ranges
  for (const [key, range] of Object.entries(filters.sensoryRanges)) {
    const metric = SENSORY_METRICS.find((m) => m.key === key);
    chips.push({
      key: `sensory-${key}`,
      label: `${metric?.label ?? key}: ${range.min}–${range.max}`,
      onRemove: () => {
        const next = { ...filters.sensoryRanges };
        delete next[key as SensoryMetricKey];
        onFiltersChange({ ...filters, sensoryRanges: next });
      },
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-xs font-medium text-muted-foreground mr-1">
        Active filters:
      </span>
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 text-sky-800 text-xs font-medium pl-3 pr-1.5 py-1"
        >
          {chip.label}
          <button
            onClick={chip.onRemove}
            className="rounded-full p-0.5 hover:bg-sky-200 transition-colors"
          >
            <X size={10} />
          </button>
        </span>
      ))}
      <Button
        variant="ghost"
        size="sm"
        className="h-7 text-xs text-muted-foreground hover:text-red-600 hover:bg-transparent"
        onClick={() => onFiltersChange(EMPTY_FILTERS)}
      >
        Clear all
      </Button>
    </div>
  );
};
