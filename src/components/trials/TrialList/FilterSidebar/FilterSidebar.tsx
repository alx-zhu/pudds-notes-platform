import { useEffect } from "react";
import { SlidersHorizontal } from "lucide-react";
import {
  PROCESSING_TYPES,
  FLAVORS,
  THERMAL_PROCESSING_TYPES,
  STORAGE_TIMES,
} from "@/config/trial.config";
import { useAllIngredientSuggestions } from "@/hooks/useTrials";
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
  const ingredients = useAllIngredientSuggestions();

  const isSensoryEnabled =
    filters.processingTypes.length > 0 &&
    filters.flavors.length > 0 &&
    filters.thermalProcessingTypes.length > 0 &&
    filters.storageTimes.length > 0;

  // Clear sensory ranges when prerequisites are removed
  useEffect(() => {
    if (!isSensoryEnabled && Object.keys(filters.sensoryRanges).length > 0) {
      onFiltersChange({ ...filters, sensoryRanges: {} });
    }
  }, [isSensoryEnabled]);

  const update = (patch: Partial<TrialFilters>) =>
    onFiltersChange({ ...filters, ...patch });

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
        <CheckboxFilterSection
          title="Thermal Processing"
          options={THERMAL_PROCESSING_TYPES.map((t) => ({
            value: t.value,
            label: t.label,
          }))}
          selected={filters.thermalProcessingTypes}
          onChange={(v) => update({ thermalProcessingTypes: v as typeof filters.thermalProcessingTypes })}
          defaultOpen
        />

        <Separator />
        <CheckboxFilterSection
          title="Storage Time"
          options={STORAGE_TIMES.map((s) => ({
            value: s.value,
            label: s.label,
          }))}
          selected={filters.storageTimes}
          onChange={(v) => update({ storageTimes: v as typeof filters.storageTimes })}
          defaultOpen
        />

        <Separator />
        {ingredients.length > 0 && (
          <>
            <CheckboxFilterSection
              title="Ingredients"
              options={ingredients.map((i) => ({ value: i, label: i }))}
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
