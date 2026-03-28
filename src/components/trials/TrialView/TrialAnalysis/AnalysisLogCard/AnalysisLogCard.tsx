import { useMemo, useState } from "react";
import { Activity, ChevronDown, Plus, Search, Trash2 } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { LogTimeline } from "./LogTimeline";
import { CreateLogModal } from "../CreateLogModal/CreateLogModal";
import { PhotosModal } from "../Photos/PhotosModal";
import { TrialImage } from "../Photos/TrialImage";
import { SensoryScoresPanel } from "./SensoryScoresPanel";
import { SensoryEvalBar } from "../Sensory/SensoryEvalBar";
import { SensoryChart } from "../Sensory/SensoryChart";
import { SensorySheet } from "../Sensory/SensorySheet";
import type { EvalView } from "../Sensory/SensoryEvalBar";
import { EVAL_COLORS } from "@/config/trial.config";
import {
  getLogLabel,
  sortLogs,
  averageEvaluationMetrics,
  hasEvaluationData,
} from "@/lib/analysisLog";
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
  const [breakdownOpen, setBreakdownOpen] = useState(false);

  const deleteMutation = useDeleteAnalysisLog(trialId);
  const deleteEvalMutation = useDeleteEvaluation(trialId);

  const logs = useMemo(
    () => sortLogs(trial?.analysisLogs ?? []),
    [trial?.analysisLogs],
  );

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
  const evaluations = useMemo(() => activeLog?.evaluations ?? [], [activeLog]);
  const hasData = hasEvaluationData(evaluations);

  const selectedEvalIndex =
    selectedEvalView !== "all"
      ? evaluations.findIndex((e) => e.id === selectedEvalView)
      : -1;
  const selectedEval =
    selectedEvalIndex !== -1 ? evaluations[selectedEvalIndex] : undefined;

  const barColor = selectedEval
    ? (EVAL_COLORS[selectedEvalIndex % EVAL_COLORS.length] ?? EVAL_COLORS[0])
    : EVAL_COLORS[0];

  const chartMetrics = useMemo(
    () =>
      selectedEval
        ? selectedEval.metrics
        : averageEvaluationMetrics(evaluations),
    [selectedEval, evaluations],
  );
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

  const handleSelectLog = (logId: string) => {
    setSelectedLogId(logId);
    setSelectedEvalView("all");
  };

  return (
    <>
      <Card className="flex flex-col overflow-hidden gap-0">
        {/* ── Card Header ── */}
        <CardHeader className="px-5 py-3 space-y-0 border-b shrink-0">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2.5">
              <div className="h-6 w-6 rounded-md bg-violet-100 flex items-center justify-center shrink-0">
                <Activity size={13} className="text-violet-600" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                Sensory Evaluation
              </p>
            </div>
            {logs.length > 0 && (
              <Button
                size="xs"
                onClick={() => openCreateModal()}
                className="gap-1"
              >
                <Plus size={12} />
                Add Log
              </Button>
            )}
          </div>
        </CardHeader>

        {/* ── Content depends on whether logs exist ── */}
        {logs.length === 0 ? (
          /* STATE 3: No logs at all */
          <div className="flex flex-col items-center justify-center gap-3 py-14">
            <div className="h-11 w-11 rounded-xl bg-muted flex items-center justify-center">
              <Activity size={20} className="text-muted-foreground/50" />
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                No analysis logs yet
              </p>
              <p className="text-xs text-muted-foreground/60 mt-0.5">
                Create your first log to start tracking sensory evaluations.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => openCreateModal()}
              className="gap-1.5 mt-1"
            >
              <Plus size={14} />
              Create First Log
            </Button>
          </div>
        ) : (
          <>
            {/* ── Timeline ── */}
            <div className="px-5 pt-3 pb-4 border-b">
              <LogTimeline
                groups={thermalGroups}
                activeLogId={activeLog?.id ?? null}
                onSelect={handleSelectLog}
              />
            </div>

            {/* ── Hero: Photo (left) + Scores (right) ── */}
            {activeLog && (
              <div className="p-5 border-b">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Photo — left half */}
                <div className="relative min-h-100 rounded-xl overflow-hidden">
                  <TrialImage
                    photos={activeLog.photos}
                    label={getLogLabel(activeLog)}
                    onAddPhoto={() => setPhotosLog(activeLog)}
                  />
                </div>

                {/* Scores — right half */}
                <div className="bg-muted/40 rounded-xl p-5 flex flex-col">
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Scores
                    </span>
                    <span className="text-[11px] text-muted-foreground font-medium">
                      {getLogLabel(activeLog)}
                    </span>
                  </div>

                  <div className="flex-1 flex flex-col justify-center">
                    <SensoryScoresPanel evaluations={evaluations} />
                  </div>

                  {/* CTA when no evaluations */}
                  {!hasData && (
                    <div className="text-center mt-5">
                      <Button
                        size="sm"
                        onClick={openSensoryCreate}
                        className="gap-1.5"
                      >
                        <Plus size={14} />
                        Add Evaluation
                      </Button>
                    </div>
                  )}
                </div>
                </div>
              </div>
            )}

            {/* ── Score Breakdown (collapsible) ── */}
            {activeLog && hasData && (
              <Collapsible open={breakdownOpen} onOpenChange={setBreakdownOpen}>
                <CollapsibleTrigger asChild>
                  <button className="flex items-center justify-between w-full px-5 py-3.5 hover:bg-muted/30 transition-colors cursor-pointer">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-md bg-violet-100 flex items-center justify-center shrink-0">
                        <Search size={12} className="text-violet-600" />
                      </div>
                      <span className="text-[13px] font-semibold text-foreground">
                        Score Breakdown
                      </span>
                      <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {evaluations.length} evaluation
                        {evaluations.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <ChevronDown
                      size={14}
                      className={cn(
                        "text-muted-foreground transition-transform duration-200",
                        breakdownOpen && "rotate-180",
                      )}
                    />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-5 pb-5">
                    <SensoryEvalBar
                      evaluations={evaluations}
                      selectedView={selectedEvalView}
                      onSelectView={setSelectedEvalView}
                      onEdit={openSensoryEdit}
                      onAdd={openSensoryCreate}
                    />
                    <div className="mt-3">
                      <SensoryChart
                        comparison={{
                          excludeTrialId: trialId,
                          processingType: trial?.setup?.processingType,
                          flavor: trial?.setup?.flavor,
                          thermalProcessingType:
                            activeLog.thermalProcessingType,
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
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* ── Footer ── */}
            {activeLog && (
              <div className="flex items-center justify-between px-5 py-3 border-t">
                <span className="text-[11px] text-muted-foreground font-medium">
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
                  Delete Log
                </Button>
              </div>
            )}
          </>
        )}
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
        <SensorySheet
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
