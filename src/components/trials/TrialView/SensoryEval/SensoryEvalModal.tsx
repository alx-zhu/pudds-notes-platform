import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import RatingDots from "@/components/trials/util/RatingDots";
import { useUpdateSensoryCategory } from "@/hooks/useTrials";
import { SENSORY_CATEGORIES, SENSORY_METRICS } from "@/config/trial.config";
import type { SensoryCategory, SensoryMetricKey } from "@/config/trial.config";
import type { SensoryMetrics } from "@/types/trial";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trialId: string;
  sensory: Partial<Record<SensoryCategory, SensoryMetrics>>;
  initialCategory?: SensoryCategory;
}

function firstIncompleteCategory(
  sensory: Partial<Record<SensoryCategory, SensoryMetrics>>,
): SensoryCategory {
  const incomplete = SENSORY_CATEGORIES.find(({ key }) => {
    const entry = sensory[key];
    if (!entry) return true;
    return SENSORY_METRICS.some((m) => !entry[m.key]);
  });
  return incomplete?.key ?? SENSORY_CATEGORIES[0].key;
}

function isCategoryDone(
  sensory: Partial<Record<SensoryCategory, SensoryMetrics>>,
  key: SensoryCategory,
): boolean {
  const entry = sensory[key];
  if (!entry) return false;
  return SENSORY_METRICS.every(
    (m) => entry[m.key] != null && entry[m.key] >= 1,
  );
}

export default function SensoryEvalModal({
  open,
  onOpenChange,
  trialId,
  sensory,
  initialCategory,
}: Props) {
  const [activeCategory, setActiveCategory] = useState<SensoryCategory>(
    initialCategory ?? firstIncompleteCategory(sensory),
  );
  const [draft, setDraft] = useState<Partial<SensoryMetrics>>(
    sensory[initialCategory ?? firstIncompleteCategory(sensory)] ?? {},
  );

  const mutation = useUpdateSensoryCategory(trialId);

  function selectCategory(key: SensoryCategory) {
    setActiveCategory(key);
    setDraft(sensory[key] ?? {});
  }

  function setRating(metricKey: SensoryMetricKey, value: number) {
    setDraft((d) => ({ ...d, [metricKey]: value || undefined }));
  }

  const allRated = SENSORY_METRICS.every(
    (m) => draft[m.key] != null && (draft[m.key] ?? 0) >= 1,
  );

  function handleSave() {
    if (!allRated) return;
    const metrics = draft as SensoryMetrics;
    mutation.mutate(
      { category: activeCategory, metrics },
      {
        onSuccess: (updated) => {
          const nextKey = firstIncompleteCategory(updated.sensory);
          const allDone = SENSORY_CATEGORIES.every((c) =>
            isCategoryDone(updated.sensory, c.key),
          );
          if (allDone) {
            onOpenChange(false);
          } else {
            setActiveCategory(nextKey);
            setDraft(updated.sensory[nextKey] ?? {});
          }
        },
      },
    );
  }

  const activeCategoryConfig = SENSORY_CATEGORIES.find(
    (c) => c.key === activeCategory,
  )!;

  const ratedCount = SENSORY_METRICS.filter(
    (m) => draft[m.key] != null && (draft[m.key] ?? 0) >= 1,
  ).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
          <DialogTitle>Sensory Evaluation</DialogTitle>
          <DialogDescription>
            Rate each metric from 1 to {SENSORY_METRICS[0]?.max ?? 5}
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5 min-h-0">
          {/* Category chip strip */}
          <div className="flex gap-2 flex-wrap">
            {SENSORY_CATEGORIES.map((cat) => {
              const done = isCategoryDone(sensory, cat.key);
              const active = cat.key === activeCategory;
              return (
                <button
                  key={cat.key}
                  onClick={() => selectCategory(cat.key)}
                  className={cn(
                    "text-xs font-medium px-3 py-1.5 rounded-lg cursor-pointer transition-all whitespace-nowrap",
                    done &&
                      !active &&
                      "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
                    active && "bg-foreground text-background shadow-sm",
                    !done &&
                      !active &&
                      "bg-muted text-muted-foreground ring-1 ring-transparent hover:ring-border",
                  )}
                >
                  {cat.shortLabel}
                  {done && !active && " ✓"}
                </button>
              );
            })}
          </div>

          {/* Section label with progress */}
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {activeCategoryConfig.label}
            </p>
            <span className="text-xs text-muted-foreground tabular-nums">
              {ratedCount}/{SENSORY_METRICS.length} rated
            </span>
          </div>

          {/* Metrics */}
          <div className="flex flex-col gap-2">
            {SENSORY_METRICS.map((metric) => {
              const hasValue =
                draft[metric.key] != null && (draft[metric.key] ?? 0) >= 1;
              return (
                <div
                  key={metric.key}
                  className={cn(
                    "rounded-xl px-4 py-3 flex items-center justify-between gap-4 transition-colors",
                    hasValue
                      ? "bg-blue-50/50 ring-1 ring-blue-100"
                      : "bg-muted/40 ring-1 ring-border/30",
                  )}
                >
                  <p className="text-sm font-medium text-foreground shrink-0">
                    {metric.label}
                  </p>
                  <RatingDots
                    value={draft[metric.key] ?? null}
                    max={metric.max}
                    onChange={(v) => setRating(metric.key, v)}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer — pinned */}
        <div className="px-6 py-4 border-t border-border shrink-0 flex gap-3">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Button
            size="sm"
            className="flex-1"
            disabled={!allRated || mutation.isPending}
            onClick={handleSave}
          >
            {mutation.isPending ? "Saving..." : "Save Category →"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
