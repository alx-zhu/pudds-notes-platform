import { useState } from "react";
import { ChevronRight, MessageSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { RatingDots } from "@/components/trials/util/RatingDots";
import { useAddEvaluation, useUpdateEvaluation } from "@/hooks/useTrials";
import { SENSORY_METRICS, SENSORY_METRIC_GROUPS } from "@/config/trial.config";
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

export const SensoryModal = ({
  open,
  onOpenChange,
  trialId,
  logId,
  logLabel,
  evaluation,
  onDelete,
}: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        {open && (
          <SensoryForm
            trialId={trialId}
            logId={logId}
            logLabel={logLabel}
            evaluation={evaluation}
            onClose={() => onOpenChange(false)}
            onDelete={onDelete}
          />
        )}
      </DialogContent>
    </Dialog>
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
  const [expandedMetric, setExpandedMetric] =
    useState<SensoryMetricKey | null>(null);

  const addMutation = useAddEvaluation(trialId);
  const updateMutation = useUpdateEvaluation(trialId);
  const isPending = addMutation.isPending || updateMutation.isPending;

  const ratedCount = SENSORY_METRICS.filter(
    (m) => metrics[m.key] != null && (metrics[m.key] ?? 0) >= 1,
  ).length;

  const canSave = label.trim().length > 0;

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
      <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
        <div className="flex items-center gap-2.5">
          <DialogTitle>
            {isEditing ? "Edit Sensory Evaluation" : "New Sensory Evaluation"}
          </DialogTitle>
          <span className="text-xs tabular-nums text-muted-foreground">
            {ratedCount}/{SENSORY_METRICS.length}
          </span>
        </div>
        <DialogDescription>{logLabel}</DialogDescription>
      </DialogHeader>

      <div className="flex-1 overflow-y-auto min-h-0 px-6 py-2 bg-muted/50">
        {/* Evaluation name */}
        <div className="py-3 flex flex-col gap-1.5">
          <Label className="text-xs font-medium text-muted-foreground">
            Evaluation Name
          </Label>
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Evaluator 1, Tasting Panel A..."
            className="h-8 text-sm"
          />
        </div>

        {SENSORY_METRIC_GROUPS.map((group) => {
          const groupMetrics = group.keys.map(
            (key) => SENSORY_METRICS.find((m) => m.key === key)!,
          );
          const ratedInGroup = groupMetrics.filter(
            (m) => metrics[m.key] != null && (metrics[m.key] ?? 0) >= 1,
          ).length;

          return (
            <div key={group.label}>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </span>
                <span className="text-[10px] tabular-nums text-muted-foreground">
                  {ratedInGroup}/{groupMetrics.length}
                </span>
              </div>

              <div className="divide-y divide-border/40">
                {groupMetrics.map((metric) => {
                  const isExpanded = expandedMetric === metric.key;
                  const hasComment = Boolean(comments[metric.key]?.trim());

                  return (
                    <Collapsible
                      key={metric.key}
                      open={isExpanded}
                      onOpenChange={(open) =>
                        setExpandedMetric(open ? metric.key : null)
                      }
                    >
                      <div className="py-3 flex items-center justify-between gap-4">
                        <CollapsibleTrigger asChild>
                          <button
                            type="button"
                            className="flex items-center gap-2 min-w-0 cursor-pointer"
                          >
                            <ChevronRight
                              size={14}
                              className={cn(
                                "text-muted-foreground transition-transform shrink-0",
                                isExpanded && "rotate-90",
                              )}
                            />
                            <span className="text-sm font-medium text-foreground truncate">
                              {metric.label}
                            </span>
                            {hasComment && (
                              <MessageSquare
                                size={12}
                                className="text-muted-foreground shrink-0"
                              />
                            )}
                          </button>
                        </CollapsibleTrigger>
                        <div className="shrink-0">
                          <RatingDots
                            value={metrics[metric.key] ?? null}
                            max={metric.max}
                            onChange={(v) => setRating(metric.key, v)}
                          />
                        </div>
                      </div>

                      <CollapsibleContent>
                        <div className="pb-3 pl-7 pr-1 flex flex-col gap-2">
                          <p className="text-xs text-muted-foreground">
                            {metric.description}
                          </p>
                          <Textarea
                            placeholder="Add a comment..."
                            value={comments[metric.key] ?? ""}
                            onChange={(e) =>
                              setComments((prev) => ({
                                ...prev,
                                [metric.key]: e.target.value || undefined,
                              }))
                            }
                            className="min-h-[60px] text-sm resize-none"
                          />
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-6 py-4 border-t border-border shrink-0 flex gap-3">
        {isEditing && onDelete && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onDelete();
              onClose();
            }}
            className="gap-1.5 text-destructive hover:text-destructive"
          >
            <Trash2 size={14} />
            Delete
          </Button>
        )}
        <div className="flex-1" />
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
    </>
  );
};
