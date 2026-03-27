import { useMemo, useState } from "react";
import { Activity, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogTimeline } from "./LogTimeline";
import { CreateLogModal } from "../CreateLogModal/CreateLogModal";
import { PhotosModal } from "../Photos/PhotosModal";
import { TrialImage } from "../Photos/TrialImage";
import { SensoryEvalBar } from "../Sensory/SensoryEvalBar";
import { SensoryChart } from "../Sensory/SensoryChart";
import { SensorySheet } from "../Sensory/SensorySheet";
import type { EvalView } from "../Sensory/SensoryEvalBar";
import { EVAL_COLORS } from "@/config/trial.config";
import { getLogLabel, sortLogs, averageEvaluationMetrics, hasEvaluationData } from "@/lib/analysisLog";
import { useTrial, useDeleteAnalysisLog, useDeleteEvaluation } from "@/hooks/useTrials";
import { SensoryScores } from "../SensoryScores";
import type { AnalysisLog, SensoryEvaluation } from "@/types/trial";

interface Props {
  trialId: string;
}

export const AnalysisLogCard = ({ trialId }: Props) => {
  const { data: trial } = useTrial(trialId);

  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createThermalType, setCreateThermalType] = useState<string | undefined>(undefined);
  const [photosLog, setPhotosLog] = useState<AnalysisLog | null>(null);
  const [sensoryState, setSensoryState] = useState<{
    logId: string;
    logLabel: string;
    evaluation?: SensoryEvaluation;
  } | null>(null);
  const [selectedEvalView, setSelectedEvalView] = useState<EvalView>("all");

  const deleteMutation = useDeleteAnalysisLog(trialId);
  const deleteEvalMutation = useDeleteEvaluation(trialId);

  const logs = useMemo(() => sortLogs(trial?.analysisLogs ?? []), [trial?.analysisLogs]);

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
        logs: [...groupLogs].sort((a, b) => a.storageTimeMinutes - b.storageTimeMinutes),
      }));
  }, [logs]);

  const activeLog = logs.find((l) => l.id === selectedLogId) ?? (logs.length > 0 ? logs[0] : null);
  const evaluations = useMemo(() => activeLog?.evaluations ?? [], [activeLog]);
  const hasData = hasEvaluationData(evaluations);

  const selectedEvalIndex = selectedEvalView !== "all"
    ? evaluations.findIndex((e) => e.id === selectedEvalView)
    : -1;
  const selectedEval = selectedEvalIndex !== -1 ? evaluations[selectedEvalIndex] : undefined;

  const barColor = selectedEval
    ? (EVAL_COLORS[selectedEvalIndex % EVAL_COLORS.length] ?? EVAL_COLORS[0])
    : EVAL_COLORS[0];

  const chartMetrics = useMemo(
    () => selectedEval ? selectedEval.metrics : averageEvaluationMetrics(evaluations),
    [selectedEval, evaluations],
  );
  const chartLabel = selectedEval
    ? selectedEval.label
    : evaluations.length >= 2 ? "All (Avg)" : "This Log";

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
    setSensoryState({ logId: activeLog.id, logLabel: getLogLabel(activeLog), evaluation });
  };

  const handleDeleteEvaluation = (evalId: string) => {
    if (!activeLog) return;
    deleteEvalMutation.mutate(
      { logId: activeLog.id, evalId },
      { onSuccess: () => setSelectedEvalView("all") },
    );
  };

  const handleSelectLog = (logId: string) => {
    setSelectedLogId(logId);
    setSelectedEvalView("all");
  };

  return (
    <>
      <Card className="flex flex-col overflow-hidden gap-0">
        <CardHeader className="px-5 pt-3 pb-4 space-y-0 border-b shrink-0">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2.5">
              <div className="h-6 w-6 rounded-md bg-violet-100 flex items-center justify-center shrink-0">
                <Activity size={13} className="text-violet-600" />
              </div>
              <p className="text-sm font-semibold text-foreground">Analysis Logs</p>
            </div>
            <Button size="xs" onClick={() => openCreateModal()} className="gap-1">
              <Plus size={12} />
              Add
            </Button>
          </div>

          {logs.length === 0 ? (
            <p className="text-xs text-muted-foreground pt-3">
              No logs yet — add one to get started.
            </p>
          ) : (
            <LogTimeline
              groups={thermalGroups}
              activeLogId={activeLog?.id ?? null}
              onSelect={handleSelectLog}
            />
          )}
        </CardHeader>

        {activeLog && evaluations.length > 0 && (
          <div className="px-5 py-4 border-b">
            <SensoryScores evaluations={evaluations} />
          </div>
        )}

        <CardContent className="p-5 flex flex-col gap-3">
          {activeLog ? (
            <>
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

                <div className="flex flex-col gap-2">
                  <SensoryEvalBar
                    evaluations={evaluations}
                    selectedView={selectedEvalView}
                    onSelectView={setSelectedEvalView}
                    onEdit={openSensoryEdit}
                    onAdd={openSensoryCreate}
                  />
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
              <p className="text-sm text-muted-foreground">No analysis logs yet</p>
              <Button size="sm" onClick={() => openCreateModal()} className="gap-1.5">
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
          onOpenChange={(open) => { if (!open) setPhotosLog(null); }}
          trialId={trialId}
          log={photosLog}
        />
      )}

      {sensoryState && (
        <SensorySheet
          open={true}
          onOpenChange={(open) => { if (!open) setSensoryState(null); }}
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
