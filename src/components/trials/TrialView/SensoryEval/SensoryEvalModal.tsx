import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
          // If all done, close modal
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto flex flex-col gap-4">
        <DialogHeader>
          <DialogTitle>Sensory Evaluation</DialogTitle>
        </DialogHeader>

        {/* Category chip strip */}
        <div className="flex gap-1.5 flex-wrap">
          {SENSORY_CATEGORIES.map((cat) => {
            const done = isCategoryDone(sensory, cat.key);
            const active = cat.key === activeCategory;
            return (
              <button
                key={cat.key}
                onClick={() => selectCategory(cat.key)}
                className={cn(
                  "text-[10px] font-bold px-2.5 py-1 rounded-lg cursor-pointer transition-colors whitespace-nowrap border",
                  done &&
                    !active &&
                    "bg-green-100 text-green-800 border-green-200",
                  active && "bg-foreground text-background border-foreground",
                  !done &&
                    !active &&
                    "bg-muted text-muted-foreground border-transparent",
                )}
              >
                {cat.shortLabel}
                {done && !active && " ✓"}
              </button>
            );
          })}
        </div>

        {/* Context label */}
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
          {activeCategoryConfig.label}
        </p>

        {/* Metrics — one per row */}
        <div className="flex flex-col gap-2">
          {SENSORY_METRICS.map((metric) => (
            <div
              key={metric.key}
              className="bg-muted/60 rounded-lg p-3 flex items-center justify-between gap-4"
            >
              <p className="text-xs font-semibold text-foreground shrink-0">
                {metric.label}
              </p>
              <RatingDots
                value={draft[metric.key] ?? null}
                max={metric.max}
                onChange={(v) => setRating(metric.key, v)}
              />
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
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
