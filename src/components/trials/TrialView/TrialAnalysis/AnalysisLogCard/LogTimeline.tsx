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
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          {thermalType}
        </span>

        <div className="flex items-start pl-4">
          {logs.map((log, i) => {
            const state = getDotState(log);
            const isSelected = activeLogId === log.id;
            return (
              <Fragment key={log.id}>
                {i > 0 && (
                  <div className="h-[2px] w-16 shrink-0 bg-border self-start mt-[9px] -mx-px" />
                )}
                <button
                  onClick={() => onSelect(log.id)}
                  className="group relative z-10 flex flex-col items-center cursor-pointer w-5 shrink-0 overflow-visible"
                >
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full transition-all border-2 bg-card",
                      state === "complete" && "border-emerald-500",
                      state === "partial" && "border-amber-400",
                      state === "empty" && "border-muted-foreground/30",
                      !isSelected && "group-hover:scale-110",
                    )}
                  >
                    <div
                      className={cn(
                        "w-full h-full rounded-full transition-all",
                        isSelected && state === "complete" && "bg-emerald-500",
                        isSelected && state === "partial" && "bg-amber-400",
                        isSelected && state === "empty" && "bg-muted-foreground/30",
                      )}
                    />
                  </div>
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
);
