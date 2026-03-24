import { Pencil, Plus } from "lucide-react";
import { EVAL_COLORS } from "@/config/trial.config";
import type { SensoryEvaluation } from "@/types/trial";
import { cn } from "@/lib/utils";

export type EvalView = "all" | string;

interface SensoryEvalBarProps {
  evaluations: SensoryEvaluation[];
  selectedView: EvalView;
  onSelectView: (view: EvalView) => void;
  onEdit: (evaluation: SensoryEvaluation) => void;
  onAdd: () => void;
}

export const SensoryEvalBar = ({
  evaluations,
  selectedView,
  onSelectView,
  onEdit,
  onAdd,
}: SensoryEvalBarProps) => {
  const selectedEval = selectedView !== "all"
    ? evaluations.find((e) => e.id === selectedView)
    : undefined;
  return (
  <div className="flex items-center gap-1.5 px-2 py-1.5 bg-muted/40 rounded-lg ring-1 ring-border/40 flex-wrap">
    <button
      onClick={() => onSelectView("all")}
      className={cn(
        "text-[11px] font-medium px-2.5 py-1 rounded-md cursor-pointer transition-all",
        selectedView === "all"
          ? "bg-background text-foreground shadow-sm ring-1 ring-border/60"
          : "text-muted-foreground hover:text-foreground hover:bg-background/60",
      )}
    >
      All
    </button>

    {evaluations.map((ev, i) => {
      const color = EVAL_COLORS[i % EVAL_COLORS.length] ?? EVAL_COLORS[0];
      const isActive = selectedView === ev.id;
      return (
        <button
          key={ev.id}
          onClick={() => onSelectView(ev.id)}
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
          onClick={() => onEdit(selectedEval)}
          className="text-[11px] font-medium px-2 py-1 rounded-md cursor-pointer transition-all text-muted-foreground hover:text-foreground hover:bg-background/60 flex items-center gap-1"
        >
          <Pencil size={10} />
          Edit
        </button>
      )}
      <button
        onClick={onAdd}
        className="text-[11px] font-medium px-2 py-1 rounded-md cursor-pointer transition-all text-muted-foreground hover:text-foreground hover:bg-background/60 flex items-center gap-0.5"
      >
        <Plus size={10} />
        Add
      </button>
    </div>
  </div>
  );
};
