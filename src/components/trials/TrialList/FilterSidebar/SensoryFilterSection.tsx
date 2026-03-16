import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { Slider } from "@/components/ui/slider";
import { SENSORY_METRICS } from "@/config/trial.config";
import type { SensoryMetricKey } from "@/config/trial.config";
import type { SensoryRange } from "@/types/filters";
import { cn } from "@/lib/utils";

interface SensoryFilterSectionProps {
  ranges: Partial<Record<SensoryMetricKey, SensoryRange>>;
  onChange: (ranges: Partial<Record<SensoryMetricKey, SensoryRange>>) => void;
  enabled: boolean;
}

export const SensoryFilterSection = ({
  ranges,
  onChange,
  enabled,
}: SensoryFilterSectionProps) => {
  const [open, setOpen] = useState(false);

  const handleRangeChange = (
    key: SensoryMetricKey,
    max: number,
    values: number[],
  ) => {
    const [min, rangeMax] = values;
    // If range is full, remove the filter
    if (min === 1 && rangeMax === max) {
      const next = { ...ranges };
      delete next[key];
      onChange(next);
    } else {
      onChange({ ...ranges, [key]: { min, max: rangeMax } });
    }
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between py-3 text-sm font-semibold hover:text-foreground/80 transition-colors">
        Sensory Evaluation
        {open ? <Minus size={16} /> : <Plus size={16} />}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className={cn("flex flex-col gap-4 pb-3", !enabled && "opacity-40 pointer-events-none")}>
          {!enabled && (
            <p className="text-[11px] text-muted-foreground leading-tight">
              Set Processing Type, Flavor, Thermal Processing, and Storage Time
              filters to enable sensory filtering.
            </p>
          )}
          {SENSORY_METRICS.map((metric) => {
            const range = ranges[metric.key as SensoryMetricKey];
            const currentMin = range?.min ?? 1;
            const currentMax = range?.max ?? metric.max;

            return (
              <div key={metric.key} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {metric.label}
                  </span>
                  <span className="text-[11px] tabular-nums text-foreground">
                    {currentMin} – {currentMax}
                  </span>
                </div>
                <Slider
                  value={[currentMin, currentMax]}
                  min={1}
                  max={metric.max}
                  step={1}
                  onValueChange={(values) =>
                    handleRangeChange(
                      metric.key as SensoryMetricKey,
                      metric.max,
                      values,
                    )
                  }
                  disabled={!enabled}
                />
              </div>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
