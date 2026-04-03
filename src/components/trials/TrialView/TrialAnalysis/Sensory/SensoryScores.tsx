import { useMemo, useState } from "react";
import { Pencil, Trash2, CircleHelp } from "lucide-react";
import { CardTabToggle } from "@/components/trials/shared/CardTabToggle";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { SummaryChart } from "./SummaryChart";
import { SensoryNavBar } from "./SensoryNavBar";
import { SensoryChart } from "./SensoryChart";
import { EVAL_COLORS } from "@/config/trial.config";
import {
  getLogLabel,
  averageEvaluationMetrics,
  hasEvaluationData,
} from "@/lib/analysisLog";
import type {
  AnalysisLog,
  SensoryEvaluation,
  EvalView,
  Trial,
} from "@/types/trial";

type ScoreView = "summary" | "breakdown";

const SCORE_VIEW_OPTIONS = [
  { value: "summary" as const, label: "Summary" },
  { value: "breakdown" as const, label: "Breakdown" },
];

interface Props {
  activeLog: AnalysisLog;
  trialId: string;
  trial: Trial;
  onOpenSensoryCreate: () => void;
  onOpenSensoryEdit: (evaluation: SensoryEvaluation) => void;
  onDeleteSensoryEval: (evaluation: SensoryEvaluation) => void;
}

export const SensoryScores = ({
  activeLog,
  trialId,
  trial,
  onOpenSensoryCreate,
  onOpenSensoryEdit,
  onDeleteSensoryEval,
}: Props) => {
  const [selectedEvalView, setSelectedEvalView] = useState<EvalView>("all");
  const [scoreView, setScoreView] = useState<ScoreView>("summary");

  const evaluations = useMemo(() => activeLog.evaluations ?? [], [activeLog]);
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

  const displayEvaluations = useMemo(
    () => (selectedEval ? [selectedEval] : evaluations),
    [selectedEval, evaluations],
  );

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

  const evalActions = hasData ? (
    <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1">
      {selectedEval ? (
        <>
          <button
            onClick={() => onOpenSensoryEdit(selectedEval)}
            className="text-[11px] font-medium px-2 py-1 rounded-md cursor-pointer transition-all text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-1"
          >
            <Pencil size={11} />
            Edit
          </button>
          <button
            onClick={() => onDeleteSensoryEval(selectedEval)}
            className="text-[11px] font-medium px-2 py-1 rounded-md cursor-pointer transition-all text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex items-center gap-1"
          >
            <Trash2 size={11} />
            Delete
          </button>
        </>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="text-[11px] font-medium px-2 py-1 rounded-md cursor-default transition-all text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-1">
              <CircleHelp size={16} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left">
            Scores are averaged across all evaluations. To edit or delete one,
            select it by name in the bar above.
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  ) : null;

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-3 h-full">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Scores
            </span>
            <span className={cn(!hasData && "invisible")}>
              <CardTabToggle
                value={scoreView}
                onChange={setScoreView}
                options={SCORE_VIEW_OPTIONS}
              />
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground font-medium">
            {getLogLabel(activeLog)}
          </span>
        </div>

        {/* Eval selector bar — always rendered to preserve layout height */}
        <SensoryNavBar
          evaluations={evaluations}
          selectedView={selectedEvalView}
          onSelectView={setSelectedEvalView}
          onAdd={onOpenSensoryCreate}
        />

        {/* Content */}
        {scoreView === "summary" ? (
          <div
            className={cn(
              "relative bg-muted/20 rounded-xl ring-1 ring-border/40 p-5 flex flex-col justify-center flex-1",
              !hasData && "cursor-pointer hover:bg-muted/40 transition-colors",
            )}
            onClick={!hasData ? onOpenSensoryCreate : undefined}
          >
            {evalActions}
            <SummaryChart evaluations={displayEvaluations} />
          </div>
        ) : (
          <div className="relative flex-1 min-h-0">
            {evalActions}
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
              onAddData={onOpenSensoryCreate}
            />
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};
