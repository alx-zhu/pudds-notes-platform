import { useMemo, useState } from "react";
import { MessageSquare, Pencil, FlaskConical, Clock } from "lucide-react";
import { useReadOnly } from "@/contexts/ReadOnlyContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTrial, useUpdateEvaluation } from "@/hooks/useTrials";
import {
  SENSORY_METRICS,
  SENSORY_METRIC_GROUPS,
  EVAL_COLORS,
} from "@/config/trial.config";
import type { SensoryMetricKey } from "@/config/trial.config";
import type {
  SensoryEvaluation,
  PartialSensoryComments,
} from "@/types/trial";
import { getLogLabel } from "@/lib/analysisLog";
import { formatStorageTime } from "@/lib/storageTime";

const CATEGORY_COLORS: Record<string, string> = {
  "Taste & Flavor": "#10b981",
  Texture: "#3b82f6",
  Appearance: "#f59e0b",
};

function getInitials(label: string): string {
  const words = label.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return label.slice(0, 2).toUpperCase();
}

interface CommentEntry {
  logId: string;
  logLabel: string; // for SensoryForm title only
  thermalProcessingType: string;
  storageTimeMinutes: number;
  evalId: string;
  evalLabel: string;
  evalColor: string;
  metricKey: SensoryMetricKey;
  metricLabel: string;
  comment: string;
  existingComments: PartialSensoryComments;
  evaluation: SensoryEvaluation;
}

interface MetricThread {
  metricLabel: string;
  comments: CommentEntry[];
}

interface CategoryGroup {
  label: string;
  color: string;
  threads: MetricThread[];
}

interface Props {
  trialId: string;
  onOpenEval: (logId: string, logLabel: string, evaluation: SensoryEvaluation) => void;
}

export const CommentsCard = ({ trialId, onOpenEval }: Props) => {
  const { data: trial } = useTrial(trialId);
  const updateMutation = useUpdateEvaluation(trialId);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [draftText, setDraftText] = useState("");
  const isReadOnly = useReadOnly();

  const { categories, totalComments } = useMemo(() => {
    const logs = trial?.analysisLogs ?? [];

    const allComments: CommentEntry[] = logs.flatMap((log) =>
      log.evaluations.flatMap((ev, evIndex) => {
        if (!ev.comments) return [];
        const color = EVAL_COLORS[evIndex % EVAL_COLORS.length] ?? EVAL_COLORS[0];
        return Object.entries(ev.comments)
          .filter(([, value]) => value?.trim())
          .map(([key, value]) => ({
            logId: log.id,
            logLabel: getLogLabel(log),
            thermalProcessingType: log.thermalProcessingType,
            storageTimeMinutes: log.storageTimeMinutes,
            evalId: ev.id,
            evalLabel: ev.label,
            evalColor: color,
            metricKey: key as SensoryMetricKey,
            metricLabel: SENSORY_METRICS.find((m) => m.key === key)?.label ?? key,
            comment: value!,
            existingComments: ev.comments ?? {},
            evaluation: ev,
          }));
      }),
    );

    const groups: CategoryGroup[] = SENSORY_METRIC_GROUPS.map((group) => {
      const groupComments = allComments.filter((c) =>
        group.keys.includes(c.metricKey),
      );
      const threadMap = new Map<string, CommentEntry[]>();
      for (const c of groupComments) {
        threadMap.set(c.metricKey, [...(threadMap.get(c.metricKey) ?? []), c]);
      }
      return {
        label: group.label,
        color: CATEGORY_COLORS[group.label] ?? "#8c8c96",
        threads: [...threadMap.entries()].map(([, comments]) => ({
          metricLabel: comments[0].metricLabel,
          comments,
        })),
      };
    });

    return { categories: groups, totalComments: allComments.length };
  }, [trial?.analysisLogs]);

  const startEdit = (entry: CommentEntry) => {
    setEditingKey(`${entry.evalId}-${entry.metricKey}`);
    setDraftText(entry.comment);
  };

  const saveEdit = (entry: CommentEntry) => {
    updateMutation.mutate(
      {
        logId: entry.logId,
        evalId: entry.evalId,
        input: { comments: { ...entry.existingComments, [entry.metricKey]: draftText } },
      },
      { onSuccess: () => setEditingKey(null) },
    );
  };

  if (totalComments === 0) return null;

  return (
    <Card className="flex flex-col overflow-hidden gap-0">
      <CardHeader className="py-3 px-5 flex items-center justify-between border-b shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="h-6 w-6 rounded-md bg-amber-100 flex items-center justify-center">
            <MessageSquare size={13} className="text-amber-600" />
          </div>
          <p className="text-sm font-semibold text-foreground">
            Sensory Comments
          </p>
        </div>
        <span className="text-xs tabular-nums text-muted-foreground">
          {totalComments} {totalComments === 1 ? "comment" : "comments"}
        </span>
      </CardHeader>

      <CardContent className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((cat) => {
            const commentCount = cat.threads.reduce(
              (s, t) => s + t.comments.length,
              0,
            );
            return (
              <div
                key={cat.label}
                className="bg-muted/20 rounded-xl ring-1 ring-border/40 p-4 flex flex-col"
              >
                {/* Column header */}
                <div
                  className="flex items-center gap-2 mb-3 pb-2.5"
                  style={{ borderBottom: `2px solid ${cat.color}` }}
                >
                  <span
                    className="w-[7px] h-[7px] rounded-full shrink-0"
                    style={{ background: cat.color }}
                  />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {cat.label}
                  </span>
                  {commentCount > 0 && (
                    <span className="text-[10px] text-muted-foreground/60 ml-auto tabular-nums">
                      {commentCount}
                    </span>
                  )}
                </div>

                {commentCount === 0 ? (
                  <div className="flex-1 flex items-center justify-center py-4">
                    <p className="text-xs text-muted-foreground/50">No comments</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {cat.threads.map((thread) => (
                      <div key={thread.metricLabel}>
                        <p className="text-[11px] font-semibold text-foreground/70 mb-1.5">
                          {thread.metricLabel}
                        </p>
                        <div className="flex flex-col">
                          {thread.comments.map((entry, i) => {
                            const key = `${entry.evalId}-${entry.metricKey}`;
                            const isEditing = editingKey === key;
                            return (
                              <div
                                key={key}
                                className={`relative flex flex-col gap-2.5 py-3 pr-7 ${i < thread.comments.length - 1 ? "border-b border-border/40" : ""}`}
                              >
                                {/* Edit button */}
                                {!isEditing && !isReadOnly && (
                                  <button
                                    className="absolute top-3 right-0 h-6 w-6 rounded flex items-center justify-center text-muted-foreground/30 hover:text-muted-foreground hover:bg-muted transition-colors"
                                    onClick={() => startEdit(entry)}
                                    aria-label="Edit comment"
                                  >
                                    <Pencil size={11} />
                                  </button>
                                )}

                                {/* Evaluator row */}
                                <div className="flex items-center gap-2">
                                  {isReadOnly ? (
                                    <span
                                      className="w-[22px] h-[22px] rounded-md shrink-0 flex items-center justify-center text-[9px] font-bold text-white"
                                      style={{ background: entry.evalColor }}
                                    >
                                      {getInitials(entry.evalLabel)}
                                    </span>
                                  ) : (
                                    <button
                                      className="w-[22px] h-[22px] rounded-md shrink-0 flex items-center justify-center text-[9px] font-bold text-white hover:opacity-75 transition-opacity"
                                      style={{ background: entry.evalColor }}
                                      onClick={() => onOpenEval(entry.logId, entry.logLabel, entry.evaluation)}
                                      title={`Open ${entry.evalLabel}`}
                                    >
                                      {getInitials(entry.evalLabel)}
                                    </button>
                                  )}
                                  <span className="text-xs font-semibold text-foreground">
                                    {entry.evalLabel}
                                  </span>
                                </div>

                                {/* Context chips */}
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-background rounded-md px-2 py-0.5 ring-1 ring-border/50">
                                    <FlaskConical size={10} className="text-muted-foreground/50 shrink-0" />
                                    {entry.thermalProcessingType}
                                  </span>
                                  <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-background rounded-md px-2 py-0.5 ring-1 ring-border/50">
                                    <Clock size={10} className="text-muted-foreground/50 shrink-0" />
                                    {formatStorageTime(entry.storageTimeMinutes)}
                                  </span>
                                </div>

                                {/* Comment text or edit UI */}
                                {isEditing ? (
                                  <div className="flex flex-col gap-1.5">
                                    <Textarea
                                      value={draftText}
                                      onChange={(e) => setDraftText(e.target.value)}
                                      className="text-[13px] min-h-[64px] resize-none"
                                      autoFocus
                                    />
                                    <div className="flex gap-1.5 justify-end">
                                      <Button
                                        size="xs"
                                        variant="ghost"
                                        onClick={() => setEditingKey(null)}
                                        disabled={updateMutation.isPending}
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        size="xs"
                                        onClick={() => saveEdit(entry)}
                                        disabled={updateMutation.isPending || !draftText.trim()}
                                      >
                                        Save
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-[13px] text-foreground/80 leading-relaxed">
                                    {entry.comment}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
