import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardTabToggle } from "@/components/trials/shared/CardTabToggle";
import { SummaryChart } from "./SummaryChart";
import { SensoryNavBar } from "./SensoryNavBar";
import { SensoryChart } from "./SensoryChart";
import { EVAL_COLORS } from "@/config/trial.config";
import {
  getLogLabel,
  averageEvaluationMetrics,
  hasEvaluationData,
} from "@/lib/analysisLog";
import type { AnalysisLog, SensoryEvaluation, EvalView, Trial } from "@/types/trial";

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
}

export const SensoryScores = ({
  activeLog,
  trialId,
  trial,
  onOpenSensoryCreate,
  onOpenSensoryEdit,
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

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Scores
          </span>
          {hasData && (
            <CardTabToggle
              value={scoreView}
              onChange={setScoreView}
              options={SCORE_VIEW_OPTIONS}
            />
          )}
        </div>
        <span className="text-[11px] text-muted-foreground font-medium">
          {getLogLabel(activeLog)}
        </span>
      </div>

      {/* Eval selector bar */}
      {hasData && (
        <SensoryNavBar
          evaluations={evaluations}
          selectedView={selectedEvalView}
          onSelectView={setSelectedEvalView}
          onEdit={onOpenSensoryEdit}
          onAdd={onOpenSensoryCreate}
        />
      )}

      {/* Content */}
      {scoreView === "summary" ? (
        <div className="bg-muted/20 rounded-xl ring-1 ring-border/40 p-5 flex flex-col justify-center flex-1">
          <SummaryChart evaluations={displayEvaluations} />
        </div>
      ) : (
        <div className="flex-1 min-h-0">
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

      {/* CTA when no evaluations */}
      {!hasData && (
        <div className="text-center mt-2">
          <Button
            size="sm"
            onClick={onOpenSensoryCreate}
            className="gap-1.5"
          >
            <Plus size={14} />
            Add Evaluation
          </Button>
        </div>
      )}
    </div>
  );
};
