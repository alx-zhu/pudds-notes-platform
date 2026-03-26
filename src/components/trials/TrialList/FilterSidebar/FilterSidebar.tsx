import { useEffect } from "react";
import { SlidersHorizontal } from "lucide-react";
import { PROCESSING_TYPES, FLAVORS } from "@/config/trial.config";
import {
  useAllThermalProcessingTypeSuggestions,
  useAllStorageTimeSuggestions,
} from "@/hooks/useTrials";
import { useIngredients } from "@/hooks/useIngredients";
import { formatStorageTime } from "@/lib/storageTime";
import type { TrialFilters } from "@/types/filters";
import { Separator } from "@/components/ui/separator";
import { CheckboxFilterSection } from "./CheckboxFilterSection";
import { DateRangeFilterSection } from "./DateRangeFilterSection";
import { SensoryFilterSection } from "./SensoryFilterSection";

interface FilterSidebarProps {
  filters: TrialFilters;
  onFiltersChange: (filters: TrialFilters) => void;
}

export const FilterSidebar = ({
  filters,
  onFiltersChange,
}: FilterSidebarProps) => {
  const { data: ingredients = [] } = useIngredients();
  const thermalSuggestions = useAllThermalProcessingTypeSuggestions();
  const storageSuggestions = useAllStorageTimeSuggestions();

  const isSensoryEnabled =
    filters.processingTypes.length > 0 &&
    filters.flavors.length > 0 &&
    filters.thermalProcessingTypes.length > 0 &&
    filters.storageTimeMinutes.length > 0;

  // Clear sensory ranges when prerequisites are removed
  useEffect(() => {
    if (!isSensoryEnabled && Object.keys(filters.sensoryRanges).length > 0) {
      onFiltersChange({ ...filters, sensoryRanges: {} });
    }
  }, [isSensoryEnabled]);

  const update = (patch: Partial<TrialFilters>) =>
    onFiltersChange({ ...filters, ...patch });

  // Storage time uses number[] internally but CheckboxFilterSection expects string[]
  const storageStringSelected = filters.storageTimeMinutes.map(String);
  const handleStorageChange = (selected: string[]) => {
    update({ storageTimeMinutes: selected.map(Number) });
  };

  return (
    <aside className="w-64 shrink-0 border-r border-border overflow-y-auto bg-card">
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <SlidersHorizontal size={14} />
          Filters
        </div>
      </div>

      <div className="px-4">
        <Separator />
        <CheckboxFilterSection
          title="Processing Type"
          options={PROCESSING_TYPES.map((p) => ({
            value: p.value,
            label: p.label,
          }))}
          selected={filters.processingTypes}
          onChange={(v) => update({ processingTypes: v as typeof filters.processingTypes })}
          defaultOpen
        />

        <Separator />
        <CheckboxFilterSection
          title="Flavor"
          options={FLAVORS.map((f) => ({ value: f.value, label: f.label }))}
          selected={filters.flavors}
          onChange={(v) => update({ flavors: v as typeof filters.flavors })}
          defaultOpen
        />

        <Separator />
        {thermalSuggestions.length > 0 && (
          <>
            <CheckboxFilterSection
              title="Thermal Processing"
              options={thermalSuggestions.map((t) => ({
                value: t,
                label: t,
              }))}
              selected={filters.thermalProcessingTypes}
              onChange={(v) => update({ thermalProcessingTypes: v })}
              defaultOpen
            />
            <Separator />
          </>
        )}

        {storageSuggestions.length > 0 && (
          <>
            <CheckboxFilterSection
              title="Storage Time"
              options={storageSuggestions.map((m) => ({
                value: String(m),
                label: formatStorageTime(m),
              }))}
              selected={storageStringSelected}
              onChange={handleStorageChange}
              defaultOpen
            />
            <Separator />
          </>
        )}

        {ingredients.length > 0 && (
          <>
            <CheckboxFilterSection
              title="Ingredients"
              options={ingredients.map((i) => ({ value: i.name, label: i.name }))}
              selected={filters.ingredients}
              onChange={(v) => update({ ingredients: v })}
            />
            <Separator />
          </>
        )}

        <DateRangeFilterSection
          from={filters.dateRange.from}
          to={filters.dateRange.to}
          onChange={(from, to) => update({ dateRange: { from, to } })}
        />

        <Separator />
        <SensoryFilterSection
          ranges={filters.sensoryRanges}
          onChange={(sensoryRanges) => update({ sensoryRanges })}
          enabled={isSensoryEnabled}
        />
      </div>
    </aside>
  );
};
