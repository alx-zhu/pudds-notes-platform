import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PROCESSING_TYPES,
  FLAVORS,
  SENSORY_SCORE_CATEGORIES,
  SENSORY_CATEGORY_STYLES,
} from "@/config/trial.config";
import type { ScoreCategoryKey } from "@/config/trial.config";
import { EMPTY_FILTERS, DEFAULT_SORT } from "@/types/filters";
import type { TrialFilters, SortByScore } from "@/types/filters";
import { format, parseISO } from "date-fns";

interface ActiveFiltersBarProps {
  filters: TrialFilters;
  onFiltersChange: (filters: TrialFilters) => void;
  sortBy: SortByScore;
  onSortChange: (sort: SortByScore) => void;
}

interface Chip {
  key: string;
  label: string;
  chipClass: string;
  onRemove?: () => void;
}

function getSortLabel(sortBy: NonNullable<SortByScore>): string {
  if (sortBy === "overall") return "Overall";
  return SENSORY_SCORE_CATEGORIES.find((c) => c.key === sortBy)!.label;
}

function getSortChipClass(sortBy: NonNullable<SortByScore>): string {
  if (sortBy === "overall") return "bg-foreground text-background";
  return SENSORY_CATEGORY_STYLES[sortBy as ScoreCategoryKey].chip;
}

export const ActiveFiltersBar = ({
  filters,
  onFiltersChange,
  sortBy,
  onSortChange,
}: ActiveFiltersBarProps) => {
  const chips: Chip[] = [];

  // Processing Types
  for (const val of filters.processingTypes) {
    const config = PROCESSING_TYPES.find((p) => p.value === val);
    chips.push({
      key: `pt-${val}`,
      label: config?.label ?? val,
      chipClass: `${config?.color ?? "bg-muted text-foreground"} pl-3 pr-1.5`,
      onRemove: () =>
        onFiltersChange({
          ...filters,
          processingTypes: filters.processingTypes.filter((v) => v !== val),
        }),
    });
  }

  // Flavors
  for (const val of filters.flavors) {
    const config = FLAVORS.find((f) => f.value === val);
    chips.push({
      key: `fl-${val}`,
      label: config?.label ?? val,
      chipClass: `${config?.color ?? "bg-muted text-foreground"} pl-3 pr-1.5`,
      onRemove: () =>
        onFiltersChange({
          ...filters,
          flavors: filters.flavors.filter((v) => v !== val),
        }),
    });
  }

  // Date range
  if (filters.dateRange.from) {
    chips.push({
      key: "date-from",
      label: `From ${format(parseISO(filters.dateRange.from), "MMM d, yyyy")}`,
      chipClass: "bg-muted text-foreground pl-3 pr-1.5",
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
      label: `To ${format(parseISO(filters.dateRange.to), "MMM d, yyyy")}`,
      chipClass: "bg-muted text-foreground pl-3 pr-1.5",
      onRemove: () =>
        onFiltersChange({
          ...filters,
          dateRange: { ...filters.dateRange, to: null },
        }),
    });
  }

  // Sort indicator (not removable — informational, colored by category)
  if (sortBy != null) {
    chips.push({
      key: "sort",
      label: `Sort: ${getSortLabel(sortBy)} ↓`,
      chipClass: `${getSortChipClass(sortBy)} pl-3 pr-3`,
    });
  }

  if (chips.length === 0) return null;

  const handleClearAll = () => {
    onFiltersChange(EMPTY_FILTERS);
    onSortChange(DEFAULT_SORT);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-xs font-medium text-muted-foreground mr-1">
        Active filters:
      </span>
      {chips.map((chip) => (
        <span
          key={chip.key}
          className={`inline-flex items-center gap-1.5 rounded-full text-xs font-medium py-1 ${chip.chipClass}`}
        >
          {chip.label}
          {chip.onRemove && (
            <button
              onClick={chip.onRemove}
              className="rounded-full p-0.5 hover:bg-black/10 transition-colors"
            >
              <X size={10} />
            </button>
          )}
        </span>
      ))}
      <Button
        variant="ghost"
        size="sm"
        className="h-7 text-xs text-muted-foreground hover:text-red-600 hover:bg-transparent"
        onClick={handleClearAll}
      >
        Clear all
      </Button>
    </div>
  );
};
