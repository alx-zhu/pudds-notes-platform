import { Fragment } from "react";
import { isLogComplete } from "@/lib/completion";
import { hasEvaluationData } from "@/lib/analysisLog";
import { formatStorageTime } from "@/lib/storageTime";
import type { AnalysisLog } from "@/types/trial";
import { cn } from "@/lib/utils";

interface ThermalGroup {
  thermalType: string;
  logs: AnalysisLog[];
}

interface LogTimelineProps {
  groups: ThermalGroup[];
  activeLogId: string | null;
  onSelect: (logId: string) => void;
}

const getDotState = (log: AnalysisLog): "complete" | "partial" | "empty" => {
  if (isLogComplete(log)) return "complete";
  if (hasEvaluationData(log.evaluations)) return "partial";
  return "empty";
};

export const LogTimeline = ({ groups, activeLogId, onSelect }: LogTimelineProps) => (
  <div className="flex flex-col gap-4 pt-3">
    {groups.map(({ thermalType, logs }) => (
      <div key={thermalType} className="flex flex-col gap-2">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          {thermalType}
        </span>

        <div className="flex items-start">
          {logs.map((log, i) => {
            const state = getDotState(log);
            const isSelected = activeLogId === log.id;
            return (
              <Fragment key={log.id}>
                {i > 0 && (
                  /* Line: flex-1 so it stretches, min-w-8, vertically centered on 14px dot */
                  <div className="h-[2px] flex-1 min-w-8 bg-border self-start mt-[7px] -mx-px" />
                )}
                <button
                  onClick={() => onSelect(log.id)}
                  className="group relative z-10 flex flex-col items-center cursor-pointer shrink-0 overflow-visible"
                >
                  <div
                    className={cn(
                      "rounded-full border-2 transition-all",
                      /* Inactive: 14px. Active: 18px (shifted up 2px to keep line aligned) */
                      isSelected ? "w-[18px] h-[18px] -mt-[2px]" : "w-3.5 h-3.5",
                      /* Unselected: outline only, white fill */
                      !isSelected && state === "complete" && "border-emerald-500 bg-card group-hover:scale-110",
                      !isSelected && state === "partial" && "border-amber-400 bg-card group-hover:scale-110",
                      !isSelected && state === "empty" && "border-muted-foreground/25 bg-card group-hover:scale-110",
                      /* Selected: filled solid with colored ring */
                      isSelected && state === "complete" && "border-emerald-500 bg-emerald-500 ring-[3px] ring-emerald-500/20",
                      isSelected && state === "partial" && "border-amber-400 bg-amber-400 ring-[3px] ring-amber-400/20",
                      isSelected && state === "empty" && "border-muted-foreground/25 bg-muted-foreground/25 ring-[3px] ring-muted-foreground/10",
                    )}
                  />
                  <span
                    className={cn(
                      "mt-1.5 text-[11px] whitespace-nowrap transition-colors",
                      isSelected
                        ? "text-foreground font-bold"
                        : "text-muted-foreground font-medium group-hover:text-foreground",
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
);
