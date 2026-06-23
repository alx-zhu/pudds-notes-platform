import { Pencil, Plus, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatStorageTime } from "@/lib/storageTime";
import type { AnalysisLog, PhysicalMeasurements } from "@/types/trial";
import { cn } from "@/lib/utils";

const hasData = (m?: PhysicalMeasurements) =>
  m != null && Object.values(m).some((v) => v != null);

const METRICS = [
  { label: "Bostwick (s)", key: "bostwickTime" as const },
  { label: "Bostwick (cm)", key: "bostwickDistance" as const },
  { label: "pH", key: "pH" as const },
  { label: "Syneresis (%)", key: "syneresis" as const },
] as const;

interface Props {
  logs: AnalysisLog[];
  activeLogId: string | null;
  isReadOnly: boolean;
  onOpenSheet: () => void;
}

export const PhysicalMeasurementsSection = ({
  logs,
  activeLogId,
  isReadOnly,
  onOpenSheet,
}: Props) => {
  const sortedLogs = [...logs].sort(
    (a, b) => a.storageTimeMinutes - b.storageTimeMinutes,
  );
  const activeLog =
    sortedLogs.find((l) => l.id === activeLogId) ?? sortedLogs[0] ?? null;
  // The matrix shows every timepoint as a column, so it renders whenever ANY
  // timepoint has data — not just the selected one.
  const anyMeasurements = sortedLogs.some((l) => hasData(l.measurements));
  const activeHasData = hasData(activeLog?.measurements);
  const activeLabel = activeLog
    ? formatStorageTime(activeLog.storageTimeMinutes)
    : "—";

  return (
    <div className="p-5 border-t border-border">
      {/* Section header */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-[9px] text-[11px] font-semibold uppercase tracking-[.06em] text-muted-foreground">
          <div className="h-[18px] w-[18px] rounded-[6px] bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <Ruler size={11} />
          </div>
          Physical Measurements{" "}
          <span className="text-[12.5px] font-bold text-foreground normal-case tracking-normal">
            · {activeLabel}
          </span>{" "}
          <span className="font-normal normal-case tracking-normal text-muted-foreground">
            · industrial only
          </span>
        </div>
        {!isReadOnly && anyMeasurements && (
          <Button
            size="xs"
            variant="outline"
            onClick={onOpenSheet}
            className="gap-1"
          >
            {activeHasData ? (
              <>
                <Pencil size={11} />
                Edit
              </>
            ) : (
              <>
                <Plus size={12} />
                Add measurements
              </>
            )}
          </Button>
        )}
      </div>

      {/* Body */}
      {anyMeasurements ? (
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-[11px] font-semibold text-muted-foreground py-[9px] px-2 text-left w-[140px] border-b border-border" />
              {sortedLogs.map((log) => (
                <th
                  key={log.id}
                  className={cn(
                    "text-[11px] font-semibold text-muted-foreground py-[9px] px-2 text-center border-b border-border",
                    log.id === activeLogId && "bg-muted/70",
                  )}
                >
                  {formatStorageTime(log.storageTimeMinutes)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {METRICS.map((metric, metricIdx) => {
              const isLastRow = metricIdx === METRICS.length - 1;
              return (
                <tr key={metric.key}>
                  <td
                    className={cn(
                      "text-[12.5px] font-medium text-muted-foreground py-[10px] px-2 text-left",
                      !isLastRow && "border-b border-border",
                    )}
                  >
                    {metric.label}
                  </td>
                  {sortedLogs.map((log) => {
                    const value = log.measurements?.[metric.key];
                    return (
                      <td
                        key={log.id}
                        className={cn(
                          "text-[13.5px] font-semibold text-foreground py-[10px] px-2 text-center tabular-nums",
                          log.id === activeLogId && "bg-muted/70",
                          !isLastRow && "border-b border-border",
                          value == null &&
                            "text-muted-foreground/45 font-normal",
                        )}
                      >
                        {value != null ? value : "—"}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <div className="flex items-center justify-between border border-dashed border-border bg-muted/40 rounded-lg px-4 py-3.5 text-[12.5px] text-muted-foreground">
          No measurements recorded for {activeLabel}
          {!isReadOnly && (
            <Button
              size="xs"
              onClick={onOpenSheet}
              className="gap-1 ml-4 shrink-0"
            >
              <Plus size={12} />
              Add measurements
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
