import { ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  PROCESSING_TYPES,
  FLAVORS,
  SENSORY_SCORE_CATEGORIES,
  SENSORY_CATEGORY_STYLES,
} from "@/config/trial.config";
import type { ProcessingType, Flavor } from "@/config/trial.config";
import { EMPTY_FILTERS } from "@/types/filters";
import type { TrialFilters, SortByScore } from "@/types/filters";

interface Props {
  filters: TrialFilters;
  onFiltersChange: (f: TrialFilters) => void;
  sortBy: SortByScore;
  onSortChange: (s: SortByScore) => void;
}

const SORT_OPTIONS: { value: SortByScore; label: string; dot?: string }[] = [
  { value: null, label: "Trial #" },
  { value: "overall", label: "Overall", dot: "bg-foreground" },
  ...SENSORY_SCORE_CATEGORIES.map((c) => ({
    value: c.key as SortByScore,
    label: c.label,
    dot: SENSORY_CATEGORY_STYLES[c.key].bar,
  })),
];

const ACTIVE_TRIGGER =
  "bg-foreground text-background hover:bg-foreground/90 hover:text-background border-transparent";

function colorDot(colorClass: string) {
  const bg = colorClass.split(" ")[0];
  return <span className={cn("h-2 w-2 rounded-full shrink-0", bg)} />;
}

export const TrialControls = ({
  filters,
  onFiltersChange,
  sortBy,
  onSortChange,
}: Props) => {
  const processingLabel =
    PROCESSING_TYPES.find((p) => p.value === filters.processingType)?.label ?? "All";
  const flavorLabel =
    FLAVORS.find((f) => f.value === filters.flavor)?.label ?? "All";
  const sortLabel =
    SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? "Trial #";

  return (
    <div className="flex items-center gap-2">
      {/* Processing Type */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "rounded-full h-9 gap-1.5 font-normal",
              filters.processingType && ACTIVE_TRIGGER,
            )}
          >
            Process: {processingLabel}
            <ChevronDown size={13} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-40">
          <DropdownMenuItem
            onClick={() => onFiltersChange({ ...filters, processingType: null })}
            className="flex items-center justify-between py-2 px-3"
          >
            <span>All</span>
            {!filters.processingType && (
              <Check size={13} className="text-muted-foreground" />
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {PROCESSING_TYPES.map((pt) => (
            <DropdownMenuItem
              key={pt.value}
              onClick={() =>
                onFiltersChange({
                  ...filters,
                  processingType: pt.value as ProcessingType,
                })
              }
              className="flex items-center gap-2.5 py-2 px-3"
            >
              {colorDot(pt.color)}
              <span className="flex-1">{pt.label}</span>
              {filters.processingType === pt.value && (
                <Check size={13} className="text-muted-foreground" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Flavor */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "rounded-full h-9 gap-1.5 font-normal",
              filters.flavor && ACTIVE_TRIGGER,
            )}
          >
            Flavor: {flavorLabel}
            <ChevronDown size={13} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-40">
          <DropdownMenuItem
            onClick={() => onFiltersChange({ ...filters, flavor: null })}
            className="flex items-center justify-between py-2 px-3"
          >
            <span>All</span>
            {!filters.flavor && (
              <Check size={13} className="text-muted-foreground" />
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {FLAVORS.map((f) => (
            <DropdownMenuItem
              key={f.value}
              onClick={() =>
                onFiltersChange({ ...filters, flavor: f.value as Flavor })
              }
              className="flex items-center gap-2.5 py-2 px-3"
            >
              {colorDot(f.color)}
              <span className="flex-1">{f.label}</span>
              {filters.flavor === f.value && (
                <Check size={13} className="text-muted-foreground" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Sort */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "rounded-full h-9 gap-1.5 font-normal",
              sortBy !== null && ACTIVE_TRIGGER,
            )}
          >
            Sort: {sortLabel}
            <ChevronDown size={13} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-40">
          {SORT_OPTIONS.map((opt) => (
            <DropdownMenuItem
              key={String(opt.value)}
              onClick={() => onSortChange(opt.value)}
              className="flex items-center gap-2.5 py-2 px-3"
            >
              {opt.dot ? (
                <span className={cn("h-2 w-2 rounded-full shrink-0", opt.dot)} />
              ) : (
                <span className="h-2 w-2 shrink-0" />
              )}
              <span className="flex-1">{opt.label}</span>
              {sortBy === opt.value && (
                <Check size={13} className="text-muted-foreground" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Clear (only when filters/sort active) */}
      {(filters.processingType !== null ||
        filters.flavor !== null ||
        sortBy !== null) && (
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full h-9 px-3 text-xs text-muted-foreground hover:text-foreground font-normal"
          onClick={() => {
            onFiltersChange(EMPTY_FILTERS);
            onSortChange(null);
          }}
        >
          Clear
        </Button>
      )}
    </div>
  );
};
