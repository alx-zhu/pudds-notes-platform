import { SlidersHorizontal, CalendarIcon, X } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  PROCESSING_TYPES,
  FLAVORS,
  SENSORY_SCORE_CATEGORIES,
  SENSORY_CATEGORY_STYLES,
} from "@/config/trial.config";
import type { TrialFilters, SortByScore } from "@/types/filters";
import { EMPTY_FILTERS, DEFAULT_SORT } from "@/types/filters";
import { countActiveFilters } from "@/lib/filterTrials";
import { useState } from "react";

interface FilterPopoverProps {
  filters: TrialFilters;
  onFiltersChange: (filters: TrialFilters) => void;
  sortBy: SortByScore;
  onSortChange: (sort: SortByScore) => void;
}

const SORT_OPTIONS: { value: string; label: string; activeClass: string }[] = [
  {
    value: "overall",
    label: "Overall",
    activeClass: "data-[state=on]:bg-foreground data-[state=on]:text-background data-[state=on]:shadow-sm",
  },
  ...SENSORY_SCORE_CATEGORIES.map((cat) => ({
    value: cat.key,
    label: cat.label,
    activeClass: SENSORY_CATEGORY_STYLES[cat.key].activeClass,
  })),
];

export const FilterPopover = ({
  filters,
  onFiltersChange,
  sortBy,
  onSortChange,
}: FilterPopoverProps) => {
  const activeCount = countActiveFilters(filters);
  const hasChanges = activeCount > 0 || sortBy !== DEFAULT_SORT;

  const handleClearAll = () => {
    onFiltersChange(EMPTY_FILTERS);
    onSortChange(DEFAULT_SORT);
  };

  const updateDateRange = (field: "from" | "to", value: string | null) => {
    onFiltersChange({
      ...filters,
      dateRange: { ...filters.dateRange, [field]: value },
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={activeCount > 0 ? "default" : "outline"}
          size="sm"
          className="rounded-full h-9 gap-1.5"
        >
          <SlidersHorizontal size={14} />
          Filter
          {activeCount > 0 && (
            <Badge
              variant="secondary"
              className="ml-0.5 h-4 min-w-4 px-1 text-[10px] leading-none"
            >
              {activeCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-80 p-4 flex flex-col gap-4">
        {/* Sort by Score */}
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
            Sort by Score
          </div>
          <ToggleGroup
            type="single"
            value={sortBy ?? ""}
            onValueChange={(v) =>
              onSortChange((v || null) as SortByScore)
            }
            className="w-full bg-muted rounded-lg p-1"
          >
            {SORT_OPTIONS.map((opt) => (
              <ToggleGroupItem
                key={opt.value}
                value={opt.value}
                className={cn(
                  "flex-1 text-sm font-medium py-1.5 cursor-pointer",
                  opt.activeClass,
                )}
              >
                {opt.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <Separator />

        {/* Processing Type */}
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
            Processing Type
          </div>
          <ToggleGroup
            type="multiple"
            value={filters.processingTypes}
            onValueChange={(v) =>
              onFiltersChange({
                ...filters,
                processingTypes: v as typeof filters.processingTypes,
              })
            }
            className="w-full bg-muted rounded-lg p-1"
          >
            {PROCESSING_TYPES.map((pt) => (
              <ToggleGroupItem
                key={pt.value}
                value={pt.value}
                className={cn(
                  "flex-1 text-sm font-medium py-1.5 cursor-pointer",
                  pt.activeClass,
                )}
              >
                {pt.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        {/* Flavor */}
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
            Flavor
          </div>
          <ToggleGroup
            type="multiple"
            value={filters.flavors}
            onValueChange={(v) =>
              onFiltersChange({
                ...filters,
                flavors: v as typeof filters.flavors,
              })
            }
            className="w-full bg-muted rounded-lg p-1"
          >
            {FLAVORS.map((f) => (
              <ToggleGroupItem
                key={f.value}
                value={f.value}
                className={cn(
                  "flex-1 text-sm font-medium py-1.5 cursor-pointer",
                  f.activeClass,
                )}
              >
                {f.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        {/* Date Range (optional) */}
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
            Date Range{" "}
            <span className="font-normal normal-case tracking-normal text-muted-foreground/50">
              (optional)
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <DatePickerField
              label="From"
              value={filters.dateRange.from}
              onChange={(v) => updateDateRange("from", v)}
            />
            <DatePickerField
              label="To"
              value={filters.dateRange.to}
              onChange={(v) => updateDateRange("to", v)}
            />
          </div>
        </div>

        {/* Footer */}
        {hasChanges && (
          <>
            <Separator />
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground hover:text-red-600"
                onClick={handleClearAll}
              >
                Clear all
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
};

function DatePickerField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  const [calendarOpen, setCalendarOpen] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground w-10">{label}</span>
      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 justify-start text-xs font-normal h-8"
          >
            <CalendarIcon size={12} className="mr-1.5" />
            {value ? format(parseISO(value), "MMM d, yyyy") : "Select date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value ? parseISO(value) : undefined}
            onSelect={(date) => {
              onChange(date ? date.toISOString().split("T")[0] : null);
              setCalendarOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
      {value && (
        <button
          onClick={() => onChange(null)}
          className="text-muted-foreground hover:text-foreground"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
