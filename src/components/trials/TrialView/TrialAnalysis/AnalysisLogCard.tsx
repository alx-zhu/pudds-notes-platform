import { Fragment, useMemo, useState } from "react";
import { Activity, Pencil, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreateLogModal } from "./CreateLogModal";
import { PhotosModal } from "./PhotosModal";
import { SensoryModal } from "./SensoryModal";
import { TrialImage } from "./TrialImage";
import { SensoryChart } from "./SensoryChart";
import { EVAL_COLORS } from "@/config/trial.config";
import { isLogComplete } from "@/lib/completion";
import {
  getLogLabel,
  sortLogs,
  averageEvaluationMetrics,
  hasEvaluationData,
} from "@/lib/analysisLog";
import { formatStorageTime } from "@/lib/storageTime";
import {
  useTrial,
  useDeleteAnalysisLog,
  useDeleteEvaluation,
} from "@/hooks/useTrials";
import type { AnalysisLog, SensoryEvaluation } from "@/types/trial";
import { cn } from "@/lib/utils";

interface Props {
  trialId: string;
}

type EvalView = "all" | string;

const getDotState = (log: AnalysisLog): "complete" | "partial" | "empty" => {
  if (isLogComplete(log)) return "complete";
  if (hasEvaluationData(log.evaluations)) return "partial";
  return "empty";
};

export const AnalysisLogCard = ({ trialId }: Props) => {
  const { data: trial } = useTrial(trialId);

  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createThermalType, setCreateThermalType] = useState<
    string | undefined
  >(undefined);
  const [photosLog, setPhotosLog] = useState<AnalysisLog | null>(null);
  const [sensoryState, setSensoryState] = useState<{
    logId: string;
    logLabel: string;
    evaluation?: SensoryEvaluation;
  } | null>(null);
  const [selectedEvalView, setSelectedEvalView] = useState<EvalView>("all");

  const deleteMutation = useDeleteAnalysisLog(trialId);
  const deleteEvalMutation = useDeleteEvaluation(trialId);

  const logs = sortLogs(trial?.analysisLogs ?? []);
  // Group by thermal type, sorted alphabetically; within each group sort by storage time ascending
  const thermalGroups = useMemo(() => {
    const map = new Map<string, AnalysisLog[]>();
    for (const log of logs) {
      const existing = map.get(log.thermalProcessingType) ?? [];
      map.set(log.thermalProcessingType, [...existing, log]);
    }
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([thermalType, groupLogs]) => ({
        thermalType,
        logs: [...groupLogs].sort(
          (a, b) => a.storageTimeMinutes - b.storageTimeMinutes,
        ),
      }));
  }, [logs]);

  const activeLog =
    logs.find((l) => l.id === selectedLogId) ??
    (logs.length > 0 ? logs[0] : null);

  const evaluations = activeLog?.evaluations ?? [];
  const hasData = hasEvaluationData(evaluations);

  const selectedEval =
    selectedEvalView !== "all"
      ? evaluations.find((e) => e.id === selectedEvalView)
      : undefined;

  const selectedEvalIndex = selectedEval
    ? evaluations.indexOf(selectedEval)
    : -1;
  const barColor = selectedEval
    ? (EVAL_COLORS[selectedEvalIndex % EVAL_COLORS.length] ?? EVAL_COLORS[0])
    : EVAL_COLORS[0];

  const chartMetrics = selectedEval
    ? selectedEval.metrics
    : averageEvaluationMetrics(evaluations);

  const chartLabel = selectedEval
    ? selectedEval.label
    : evaluations.length >= 2
      ? "All (Avg)"
      : "This Log";

  const openCreateModal = (thermalType?: string) => {
    setCreateThermalType(thermalType);
    setCreateOpen(true);
  };

  const openSensoryCreate = () => {
    if (!activeLog) return;
    setSensoryState({ logId: activeLog.id, logLabel: getLogLabel(activeLog) });
  };

  const openSensoryEdit = (evaluation: SensoryEvaluation) => {
    if (!activeLog) return;
    setSensoryState({
      logId: activeLog.id,
      logLabel: getLogLabel(activeLog),
      evaluation,
    });
  };

  const handleDeleteEvaluation = (evalId: string) => {
    if (!activeLog) return;
    deleteEvalMutation.mutate(
      { logId: activeLog.id, evalId },
      { onSuccess: () => setSelectedEvalView("all") },
    );
  };

  return (
    <>
      <Card className="flex flex-col overflow-hidden gap-0">
        <CardHeader className="px-5 pt-3 pb-4 space-y-0 border-b shrink-0">
          {/* Title row */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2.5">
              <div className="h-6 w-6 rounded-md bg-violet-100 flex items-center justify-center shrink-0">
                <Activity size={13} className="text-violet-600" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                Analysis Logs
              </p>
            </div>
            <Button
              size="xs"
              onClick={() => openCreateModal()}
              className="gap-1"
            >
              <Plus size={12} />
              Add
            </Button>
          </div>

          {/* Timeline rows, one per thermal type */}
          {logs.length === 0 ? (
            <p className="text-xs text-muted-foreground pt-3">
              No logs yet — add one to get started.
            </p>
          ) : (
            <div className="flex flex-col gap-4 pt-3">
              {thermalGroups.map(({ thermalType, logs: groupLogs }) => (
                <div key={thermalType} className="flex flex-col gap-2">
                  <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                    {thermalType}
                  </span>

                  {/* Timeline track */}
                  <div className="flex items-start">
                    {groupLogs.map((log, i) => {
                      const state = getDotState(log);
                      const isSelected = activeLog?.id === log.id;
                      return (
                        <Fragment key={log.id}>
                          {i > 0 && (
                            <div className="h-[2px] w-10 mt-[9px] bg-border shrink-0" />
                          )}
                          <button
                            onClick={() => {
                              setSelectedLogId(log.id);
                              setSelectedEvalView("all");
                            }}
                            className="group flex flex-col items-center cursor-pointer shrink-0"
                          >
                            <div
                              className={cn(
                                "w-5 h-5 rounded-full transition-all",
                                state === "complete" && "bg-emerald-500",
                                state === "partial" && "bg-amber-400",
                                state === "empty" && "bg-muted-foreground/20 ring-[1.5px] ring-border",
                                isSelected && "ring-[2.5px] ring-offset-2 ring-offset-card",
                                isSelected && state === "complete" && "ring-emerald-400",
                                isSelected && state === "partial" && "ring-amber-300",
                                isSelected && state === "empty" && "ring-muted-foreground/40",
                                !isSelected && "group-hover:scale-110",
                              )}
                            />
                            <span
                              className={cn(
                                "mt-1.5 text-[11px] whitespace-nowrap transition-colors",
                                isSelected
                                  ? "text-foreground font-medium"
                                  : "text-muted-foreground group-hover:text-foreground",
                              )}
                            >
                              {formatStorageTime(log.storageTimeMinutes)}
                            </span>
                          </button>
                        </Fragment>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardHeader>

        <CardContent className="p-5 flex flex-col gap-3">
          {activeLog ? (
            <>
              {/* Active log toolbar */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">
                  {getLogLabel(activeLog)}
                </span>
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => deleteMutation.mutate(activeLog.id)}
                  disabled={deleteMutation.isPending}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 size={12} />
                  Delete
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-4">
                <TrialImage
                  photos={activeLog.photos}
                  label={getLogLabel(activeLog)}
                  onAddPhoto={() => setPhotosLog(activeLog)}
                />

                {/* Chart column: eval bar above chart */}
                <div className="flex flex-col gap-2">
                  {/* Eval selection bar */}
                  <div className="flex items-center gap-1.5 px-2 py-1.5 bg-muted/40 rounded-lg ring-1 ring-border/40 flex-wrap">
                    <button
                      onClick={() => setSelectedEvalView("all")}
                      className={cn(
                        "text-[11px] font-medium px-2.5 py-1 rounded-md cursor-pointer transition-all",
                        selectedEvalView === "all"
                          ? "bg-background text-foreground shadow-sm ring-1 ring-border/60"
                          : "text-muted-foreground hover:text-foreground hover:bg-background/60",
                      )}
                    >
                      All
                    </button>

                    {evaluations.map((ev, i) => {
                      const color =
                        EVAL_COLORS[i % EVAL_COLORS.length] ?? EVAL_COLORS[0];
                      const isActive = selectedEvalView === ev.id;
                      return (
                        <button
                          key={ev.id}
                          onClick={() => setSelectedEvalView(ev.id)}
                          className={cn(
                            "text-[11px] font-medium px-2.5 py-1 rounded-md cursor-pointer transition-all flex items-center gap-1.5",
                            isActive
                              ? "bg-background shadow-sm ring-1 ring-border/60"
                              : "text-muted-foreground hover:text-foreground hover:bg-background/60",
                          )}
                          style={isActive ? { color } : undefined}
                        >
                          <span
                            className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ background: color }}
                          />
                          {ev.label}
                        </button>
                      );
                    })}

                    <div className="flex items-center gap-1 ml-auto">
                      {selectedEval && (
                        <button
                          onClick={() => openSensoryEdit(selectedEval)}
                          className="text-[11px] font-medium px-2 py-1 rounded-md cursor-pointer transition-all text-muted-foreground hover:text-foreground hover:bg-background/60 flex items-center gap-1"
                        >
                          <Pencil size={10} />
                          Edit
                        </button>
                      )}
                      <button
                        onClick={openSensoryCreate}
                        className="text-[11px] font-medium px-2 py-1 rounded-md cursor-pointer transition-all text-muted-foreground hover:text-foreground hover:bg-background/60 flex items-center gap-0.5"
                      >
                        <Plus size={10} />
                        Add
                      </button>
                    </div>
                  </div>

                  <SensoryChart
                    comparison={{
                      excludeTrialId: trialId,
                      processingType: trial?.setup?.processingType,
                      flavor: trial?.setup?.flavor,
                      thermalProcessingType: activeLog.thermalProcessingType,
                      storageTimeMinutes: activeLog.storageTimeMinutes,
                    }}
                    logMetrics={chartMetrics}
                    metricLabel={chartLabel}
                    barColor={barColor}
                    hasData={hasData}
                    onAddData={openSensoryCreate}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-12 bg-muted/20 rounded-xl ring-1 ring-border/40">
              <p className="text-sm text-muted-foreground">
                No analysis logs yet
              </p>
              <Button
                size="sm"
                onClick={() => openCreateModal()}
                className="gap-1.5"
              >
                <Plus size={14} />
                Create First Log
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateLogModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        trialId={trialId}
        initialThermalType={createThermalType}
      />

      {photosLog && (
        <PhotosModal
          open={true}
          onOpenChange={(open) => {
            if (!open) setPhotosLog(null);
          }}
          trialId={trialId}
          log={photosLog}
        />
      )}

      {sensoryState && (
        <SensoryModal
          open={true}
          onOpenChange={(open) => {
            if (!open) setSensoryState(null);
          }}
          trialId={trialId}
          logId={sensoryState.logId}
          logLabel={sensoryState.logLabel}
          evaluation={sensoryState.evaluation}
          onDelete={
            sensoryState.evaluation
              ? () => handleDeleteEvaluation(sensoryState.evaluation!.id)
              : undefined
          }
        />
      )}
    </>
  );
};
