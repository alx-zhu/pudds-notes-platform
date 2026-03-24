import { useState, useRef, useEffect, useCallback } from "react";
import { Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { SensoryQuestionCard } from "./SensoryQuestionCard";
import { useAddEvaluation, useUpdateEvaluation } from "@/hooks/useTrials";
import {
  SENSORY_METRICS,
  SENSORY_SCORE_OPTIONS,
} from "@/config/trial.config";
import type { SensoryMetricKey } from "@/config/trial.config";
import type {
  SensoryEvaluation,
  PartialSensoryMetrics,
  PartialSensoryComments,
} from "@/types/trial";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trialId: string;
  logId: string;
  logLabel: string;
  evaluation?: SensoryEvaluation;
  onDelete?: () => void;
}

export const SensorySheet = ({
  open,
  onOpenChange,
  trialId,
  logId,
  logLabel,
  evaluation,
  onDelete,
}: Props) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="data-[side=right]:sm:max-w-5xl w-full p-0 flex flex-row gap-0"
      >
        <SheetTitle className="sr-only">Sensory Evaluation</SheetTitle>
        <SheetDescription className="sr-only">{logLabel}</SheetDescription>
        <SensoryForm
          trialId={trialId}
          logId={logId}
          logLabel={logLabel}
          evaluation={evaluation}
          onClose={() => onOpenChange(false)}
          onDelete={onDelete}
        />
      </SheetContent>
    </Sheet>
  );
};

const SensoryForm = ({
  trialId,
  logId,
  logLabel,
  evaluation,
  onClose,
  onDelete,
}: {
  trialId: string;
  logId: string;
  logLabel: string;
  evaluation?: SensoryEvaluation;
  onClose: () => void;
  onDelete?: () => void;
}) => {
  const isEditing = evaluation !== undefined;

  const [label, setLabel] = useState(evaluation?.label ?? "");
  const [metrics, setMetrics] = useState<PartialSensoryMetrics>(
    evaluation?.metrics ?? {},
  );
  const [comments, setComments] = useState<PartialSensoryComments>(
    evaluation?.comments ?? {},
  );
  const [activeIndex, setActiveIndex] = useState(0);

  const addMutation = useAddEvaluation(trialId);
  const updateMutation = useUpdateEvaluation(trialId);
  const isPending = addMutation.isPending || updateMutation.isPending;

  const scrollRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<number, HTMLElement>>(new Map());

  const ratedCount = SENSORY_METRICS.filter(
    (m) => metrics[m.key] != null && (metrics[m.key] ?? 0) >= 1,
  ).length;

  const canSave = label.trim().length > 0;
  const progressPercent = (ratedCount / SENSORY_METRICS.length) * 100;

  // Scroll-spy via IntersectionObserver
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = parseInt(entry.target.id.replace("q-", ""));
            if (!isNaN(idx)) setActiveIndex(idx);
          }
        }
      },
      { root: scrollContainer, threshold: 0.35 },
    );

    cardRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const registerCard = useCallback(
    (index: number) => (el: HTMLElement | null) => {
      if (el) cardRefs.current.set(index, el);
      else cardRefs.current.delete(index);
    },
    [],
  );

  const scrollToCard = (index: number) => {
    const el = cardRefs.current.get(index);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const setRating = (key: SensoryMetricKey, value: number) => {
    setMetrics((prev) => ({ ...prev, [key]: value || undefined }));
  };

  const handleSave = () => {
    if (!canSave) return;
    const input = { label: label.trim(), metrics, comments };
    if (isEditing) {
      updateMutation.mutate(
        { logId, evalId: evaluation.id, input },
        { onSuccess: onClose },
      );
    } else {
      addMutation.mutate({ logId, input }, { onSuccess: onClose });
    }
  };

  return (
    <>
      {/* Sidebar */}
      <aside className="w-60 shrink-0 border-r bg-card flex flex-col p-5 gap-5 overflow-y-auto">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Evaluation Form
          </div>
          <div className="text-sm text-muted-foreground mt-1">{logLabel}</div>
        </div>

        {/* Progress */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>
              {ratedCount} / {SENSORY_METRICS.length}
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 flex-1">
          {SENSORY_METRICS.map((metric, i) => {
            const isRated =
              metrics[metric.key] != null && (metrics[metric.key] ?? 0) >= 1;
            const isActive = activeIndex === i;

            return (
              <button
                key={metric.key}
                type="button"
                onClick={() => scrollToCard(i)}
                className={cn(
                  "flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left text-xs font-medium transition-colors cursor-pointer",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : isRated
                      ? "text-foreground hover:bg-muted"
                      : "text-muted-foreground hover:bg-muted",
                )}
              >
                <span
                  className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors",
                    isRated
                      ? "bg-green-500 text-white"
                      : isActive
                        ? "bg-primary text-white"
                        : "border border-border text-muted-foreground bg-card",
                  )}
                >
                  {isRated ? <Check size={10} /> : i + 1}
                </span>
                <span className="truncate">{metric.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer buttons */}
        <div className="flex flex-col gap-2 mt-auto pt-4 border-t">
          {isEditing && onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onDelete();
                onClose();
              }}
              className="gap-1.5 text-destructive hover:text-destructive w-full"
            >
              <Trash2 size={14} />
              Delete
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onClose} className="w-full">
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!canSave || isPending}
            onClick={handleSave}
            className="w-full"
          >
            {isPending
              ? "Saving..."
              : isEditing
                ? "Save Changes"
                : "Add Evaluation"}
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto bg-muted/30">
        <div className="max-w-[860px] px-8 py-10">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-xl font-bold text-foreground">
              {isEditing ? "Edit Sensory Evaluation" : "New Sensory Evaluation"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-xl">
              Rate each category from 1 to 5. Expand any question for a detailed
              description of each rating level, and add notes where helpful.
            </p>
          </div>

          {/* Evaluation name */}
          <div className="mb-6 flex flex-col gap-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Evaluation Name
            </Label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Evaluator 1, Tasting Panel A..."
              className="h-9 text-sm max-w-sm"
            />
          </div>

          {/* Question cards */}
          <div className="flex flex-col gap-5">
            {SENSORY_METRICS.map((metric, i) => (
              <div key={metric.key} ref={registerCard(i)}>
                <SensoryQuestionCard
                  id={`q-${i}`}
                  index={i}
                  total={SENSORY_METRICS.length}
                  metric={metric}
                  options={SENSORY_SCORE_OPTIONS[metric.key]}
                  value={metrics[metric.key]}
                  comment={comments[metric.key]}
                  onRate={(v) => setRating(metric.key, v)}
                  onCommentChange={(c) =>
                    setComments((prev) => ({
                      ...prev,
                      [metric.key]: c || undefined,
                    }))
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
