import { useState, useRef, useEffect } from "react";
import { X, Check, Trash2 } from "lucide-react";
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
  SENSORY_METRIC_GROUPS,
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

export const SensoryForm = ({
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
        className="data-[side=right]:sm:max-w-5xl w-full p-0 flex flex-col gap-0"
      >
        <SheetTitle className="sr-only">Sensory Evaluation</SheetTitle>
        <SheetDescription className="sr-only">{logLabel}</SheetDescription>
        <SensoryFormContent
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

const SensoryFormContent = ({
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
    (m) => (metrics[m.key] ?? 0) >= 1,
  ).length;

  const canSave = label.trim().length > 0;
  const progressPercent = (ratedCount / SENSORY_METRICS.length) * 100;

  // Scroll-spy with two modes:
  // 1. Click navigation: lock scroll-spy during smooth scroll, keep clicked index
  // 2. Organic scroll: highlight topmost visible card, with bottom-of-container detection
  const scrollLocked = useRef(false);
  const settleTimer = useRef<number>(0);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (scrollLocked.current) {
        // During programmatic scroll, debounce to detect when animation ends
        clearTimeout(settleTimer.current);
        settleTimer.current = window.setTimeout(() => {
          scrollLocked.current = false;
        }, 150);
        return;
      }

      // At the very bottom, highlight the last card
      const isAtBottom =
        container.scrollTop + container.clientHeight >=
        container.scrollHeight - 2;
      if (isAtBottom) {
        setActiveIndex(SENSORY_METRICS.length - 1);
        return;
      }

      // Normal: last card whose top edge is near the container top
      const containerTop = container.getBoundingClientRect().top;
      let active = 0;
      cardRefs.current.forEach((el, idx) => {
        if (el.getBoundingClientRect().top - containerTop <= 80) active = idx;
      });
      setActiveIndex(active);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", handleScroll);
      clearTimeout(settleTimer.current);
    };
  }, []);

  const registerCard = (index: number) => (el: HTMLElement | null) => {
    if (el) cardRefs.current.set(index, el);
    else cardRefs.current.delete(index);
  };

  const scrollToCard = (index: number) => {
    setActiveIndex(index);
    scrollLocked.current = true;
    clearTimeout(settleTimer.current);
    cardRefs.current
      .get(index)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
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
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3.5 border-b bg-card shrink-0">
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-md border flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X size={13} />
          </button>
          <div>
            <div className="text-sm font-semibold text-foreground">
              Sensory Evaluation
            </div>
            <div className="text-xs text-muted-foreground">{logLabel}</div>
          </div>
        </div>
        <span className="text-xs text-muted-foreground font-medium tabular-nums">
          {ratedCount} / {SENSORY_METRICS.length} rated
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-muted shrink-0">
        <div
          className="h-full bg-green-500 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Body */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-60 shrink-0 border-r bg-card flex flex-col overflow-y-auto">
          {/* Eval name */}
          <div className="px-5 py-5 border-b">
            <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
              Evaluation Name
            </Label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Evaluator 1, Panel A..."
              className="h-8 text-xs"
            />
          </div>

          {/* Progress */}
          <div className="px-5 py-4 border-b">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] text-muted-foreground">
                Progress
              </span>
              <span className="text-[11px] font-semibold text-foreground tabular-nums">
                {ratedCount} / {SENSORY_METRICS.length}
              </span>
            </div>
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Nav groups */}
          <nav className="flex-1 py-2">
            {SENSORY_METRIC_GROUPS.map((group) => (
              <div key={group.label} className="mb-1">
                <div className="px-5 pt-3 pb-1.5 text-[9.5px] font-bold uppercase tracking-[0.06em] text-muted-foreground/70">
                  {group.label}
                </div>
                {group.keys.map((key) => {
                  const globalIndex = SENSORY_METRICS.findIndex(
                    (m) => m.key === key,
                  );
                  const metric = SENSORY_METRICS[globalIndex];
                  const isRated = (metrics[key] ?? 0) >= 1;
                  const isActive = activeIndex === globalIndex;

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => scrollToCard(globalIndex)}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-5 py-2 text-left transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <span
                        className={cn(
                          "w-[22px] h-[22px] rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
                          isRated
                            ? "bg-green-500 text-white"
                            : isActive
                              ? "bg-primary text-white"
                              : "border border-border text-muted-foreground",
                        )}
                      >
                        {isRated ? <Check size={9} /> : globalIndex + 1}
                      </span>
                      <span className="text-xs font-medium truncate">
                        {metric.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto bg-muted/30">
          {SENSORY_METRIC_GROUPS.map((group) => {
            const groupItems = group.keys.map((key) => {
              const globalIndex = SENSORY_METRICS.findIndex(
                (m) => m.key === key,
              );
              return {
                metric: SENSORY_METRICS[globalIndex],
                globalIndex,
                options: SENSORY_SCORE_OPTIONS[key],
              };
            });

            const answeredInGroup = groupItems.filter(
              ({ metric }) => (metrics[metric.key] ?? 0) >= 1,
            ).length;

            return (
              <section key={group.label} className="px-10 pt-9 last:pb-10">
                {/* Section header */}
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-[11px] font-bold uppercase tracking-[0.05em] text-foreground whitespace-nowrap">
                    {group.label}
                  </span>
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-[11px] text-muted-foreground font-medium whitespace-nowrap tabular-nums">
                    {answeredInGroup} / {groupItems.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="flex flex-col gap-3 mb-10">
                  {groupItems.map(({ metric, globalIndex, options }) => (
                    <div
                      key={metric.key}
                      id={`q-${globalIndex}`}
                      ref={registerCard(globalIndex)}
                      className="scroll-mt-6"
                    >
                      <SensoryQuestionCard
                        index={globalIndex}
                        metric={metric}
                        options={options}
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
              </section>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-3.5 border-t bg-card shrink-0">
        {isEditing && onDelete ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onDelete();
              onClose();
            }}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5"
          >
            <Trash2 size={14} />
            Delete
          </Button>
        ) : (
          <div />
        )}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!canSave || isPending}
            onClick={handleSave}
          >
            {isPending
              ? "Saving..."
              : isEditing
                ? "Save Changes"
                : "Add Evaluation"}
          </Button>
        </div>
      </div>
    </>
  );
};
