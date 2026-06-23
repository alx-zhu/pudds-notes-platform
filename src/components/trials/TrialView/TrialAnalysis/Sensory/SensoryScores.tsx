import { useState, useMemo } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useReadOnly } from "@/contexts/ReadOnlyContext";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SummaryChart } from "./SummaryChart";
import type { AnalysisLog, SensoryEvaluation } from "@/types/trial";

interface Props {
  activeLog: AnalysisLog;
  onOpenSensoryEdit: (evaluation: SensoryEvaluation) => void;
  onDeleteSensoryEval: (evaluation: SensoryEvaluation) => void;
}

export const SensoryScores = ({
  activeLog,
  onOpenSensoryEdit,
  onDeleteSensoryEval,
}: Props) => {
  const [selectedEvalId, setSelectedEvalId] = useState<string>("all");
  const isReadOnly = useReadOnly();

  const evaluations = useMemo(() => activeLog.evaluations ?? [], [activeLog]);

  // Derive the effective selection so a stale id (eval deleted, or timepoint
  // switched) falls back to "all" without a setState-in-effect.
  const selectedEval =
    evaluations.find((e) => e.id === selectedEvalId) ?? null;
  const effectiveEvalId = selectedEval ? selectedEvalId : "all";

  const displayEvaluations = selectedEval ? [selectedEval] : evaluations;

  return (
    <div className="bg-muted/50 border border-border/60 rounded-xl p-[18px] flex flex-col">
      {/* Evaluator dropdown row */}
      <div className="flex items-center gap-[9px] mb-4">
        <Select value={effectiveEvalId} onValueChange={setSelectedEvalId}>
          <SelectTrigger className="flex-1 h-8 px-3 text-[12.5px] font-medium bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              All evaluations · avg ({evaluations.length})
            </SelectItem>
            {evaluations.map((ev) => (
              <SelectItem key={ev.id} value={ev.id}>
                {ev.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedEval && !isReadOnly && (
          <>
            <Button
              size="xs"
              variant="ghost"
              onClick={() => onOpenSensoryEdit(selectedEval)}
              className="gap-1 text-muted-foreground hover:text-foreground"
            >
              <Pencil size={11} />
              Edit
            </Button>
            <Button
              size="xs"
              variant="ghost"
              onClick={() => onDeleteSensoryEval(selectedEval)}
              className="gap-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 size={11} />
              Delete
            </Button>
          </>
        )}
      </div>

      <SummaryChart evaluations={displayEvaluations} />
    </div>
  );
};
