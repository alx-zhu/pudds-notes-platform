import { useState } from "react";
import { Activity, Plus, Pencil } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AnalysisLogModal from "./AnalysisLogModal";
import TrialImage from "./TrialImage";
import SensoryChart from "./SensoryChart";
import { isLogComplete } from "@/lib/completion";
import { useTrial } from "@/hooks/useTrials";
import { THERMAL_PROCESSING_TYPES, STORAGE_TIMES } from "@/config/trial.config";
import type { AnalysisLog } from "@/types/trial";
import { cn } from "@/lib/utils";

function getLogLabel(log: AnalysisLog): string {
  const thermal =
    THERMAL_PROCESSING_TYPES.find((t) => t.value === log.thermalProcessingType)
      ?.label ?? log.thermalProcessingType;
  const storage =
    STORAGE_TIMES.find((s) => s.value === log.storageTime)?.label ??
    log.storageTime;
  return `${thermal} · ${storage}`;
}

interface Props {
  trialId: string;
}

export default function AnalysisLogCard({ trialId }: Props) {
  const { data: trial } = useTrial(trialId);

  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<AnalysisLog | undefined>();

  const logs = trial?.analysisLogs ?? [];
  const doneCount = logs.filter(isLogComplete).length;
  const allDone = logs.length > 0 && doneCount === logs.length;

  const activeLog =
    logs.find((l) => l.id === selectedLogId) ??
    (logs.length > 0 ? logs[0] : null);

  const hasAnyMetric = activeLog
    ? Object.values(activeLog.metrics).some((v) => v != null && v >= 1)
    : false;

  function openCreateModal() {
    setEditingLog(undefined);
    setModalOpen(true);
  }

  function openEditModal(log: AnalysisLog) {
    setEditingLog(log);
    setModalOpen(true);
  }

  return (
    <>
      <Card className="flex flex-col overflow-hidden gap-0">
        <CardHeader className="py-3 px-5 flex items-center justify-between border-b shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-6 rounded-md bg-violet-100 flex items-center justify-center">
              <Activity size={13} className="text-violet-600" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              Analysis Logs
            </p>
          </div>
          {logs.length === 0 ? (
            <span className="text-xs text-muted-foreground">No logs</span>
          ) : (
            <div
              className={cn(
                "flex items-center gap-1.5 text-xs font-medium",
                allDone ? "text-emerald-600" : "text-amber-600",
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  allDone ? "bg-emerald-500" : "bg-amber-500",
                )}
              />
              {doneCount}/{logs.length} done
            </div>
          )}
        </CardHeader>

        <CardContent className="p-5 flex flex-col gap-4">
          {/* Log pills + add button */}
          <div className="flex gap-2 flex-wrap shrink-0">
            {logs.map((log) => {
              const done = isLogComplete(log);
              const active = activeLog?.id === log.id;
              return (
                <button
                  key={log.id}
                  onClick={() => setSelectedLogId(log.id)}
                  className={cn(
                    "text-xs font-medium px-3 py-1.5 rounded-lg cursor-pointer transition-all whitespace-nowrap",
                    active && "bg-foreground text-background shadow-sm",
                    !active &&
                      done &&
                      "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100",
                    !active &&
                      !done &&
                      "bg-muted text-muted-foreground hover:bg-muted/80 ring-1 ring-transparent hover:ring-border",
                  )}
                >
                  {getLogLabel(log)}
                  {done && !active && " ✓"}
                </button>
              );
            })}
            <button
              onClick={openCreateModal}
              className="text-xs font-medium px-2.5 py-1.5 rounded-lg cursor-pointer transition-all bg-muted text-muted-foreground hover:bg-muted/80 ring-1 ring-transparent hover:ring-border flex items-center gap-1"
            >
              <Plus size={12} />
              Add
            </button>
          </div>

          {/* Side-by-side: Image | Chart */}
          {activeLog ? (
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-4">
              <TrialImage
                photos={activeLog.photos}
                label={getLogLabel(activeLog)}
              />
              <SensoryChart
                trialId={trialId}
                logMetrics={activeLog.metrics}
                hasData={hasAnyMetric}
                onAddData={() => openEditModal(activeLog)}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-12 bg-muted/20 rounded-xl ring-1 ring-border/40">
              <p className="text-sm text-muted-foreground">
                No analysis logs yet
              </p>
              <Button size="sm" onClick={openCreateModal} className="gap-1.5">
                <Plus size={14} />
                Create First Log
              </Button>
            </div>
          )}
        </CardContent>

        {activeLog && (
          <CardFooter className="flex justify-center shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={() => openEditModal(activeLog)}
              className="gap-2"
            >
              <Pencil size={14} />
              Edit Log
            </Button>
          </CardFooter>
        )}
      </Card>

      <AnalysisLogModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        trialId={trialId}
        existingLog={editingLog}
        allLogs={logs}
      />
    </>
  );
}
