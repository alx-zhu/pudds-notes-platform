import { Plus } from "lucide-react";
import { EVAL_COLORS } from "@/config/trial.config";
import type { SensoryEvaluation, EvalView } from "@/types/trial";
import { cn } from "@/lib/utils";

interface SensoryNavBarProps {
  evaluations: SensoryEvaluation[];
  selectedView: EvalView;
  onSelectView: (view: EvalView) => void;
  onAdd: () => void;
}

export const SensoryNavBar = ({
  evaluations,
  selectedView,
  onSelectView,
  onAdd,
}: SensoryNavBarProps) => {
  const isEmpty = evaluations.length === 0;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-2 py-1.5 bg-muted/40 rounded-lg ring-1 ring-border/40 flex-wrap",
        isEmpty && "cursor-pointer hover:bg-muted/60 transition-colors",
      )}
      onClick={isEmpty ? onAdd : undefined}
    >
      {isEmpty ? (
        <span className="text-[11px] text-muted-foreground/50 px-1 select-none">
          No evaluations yet
        </span>
      ) : (
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
      )}

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
        <button
          onClick={onAdd}
          className="text-[11px] font-medium px-2 py-1 rounded-md cursor-pointer transition-all text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-1"
        >
          <Plus size={11} />
          Add
        </button>
      </div>
    </div>
  );
};
