import { useState } from "react";
import { Activity, Plus, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreateLogModal } from "./CreateLogModal";
import { PhotosModal } from "./PhotosModal";
import { SensoryModal } from "./SensoryModal";
import { TrialImage } from "./TrialImage";
import { SensoryChart } from "./SensoryChart";
import { isLogComplete } from "@/lib/completion";
import { getLogLabel, sortLogs } from "@/lib/analysisLog";
import { useTrial, useDeleteAnalysisLog } from "@/hooks/useTrials";
import type { AnalysisLog } from "@/types/trial";
import { cn } from "@/lib/utils";

interface Props {
  trialId: string;
}

export const AnalysisLogCard = ({ trialId }: Props) => {
  const { data: trial } = useTrial(trialId);

  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [photosLog, setPhotosLog] = useState<AnalysisLog | null>(null);
  const [sensoryLog, setSensoryLog] = useState<AnalysisLog | null>(null);

  const deleteMutation = useDeleteAnalysisLog(trialId);

  const logs = sortLogs(trial?.analysisLogs ?? []);
  const doneCount = logs.filter(isLogComplete).length;
  const allDone = logs.length > 0 && doneCount === logs.length;

  const activeLog =
    logs.find((l) => l.id === selectedLogId) ??
    (logs.length > 0 ? logs[0] : null);

  const hasAnyMetric = activeLog
    ? Object.values(activeLog.metrics).some((v) => v != null && v >= 1)
    : false;

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
                  {done && !active && " \u2713"}
                </button>
              );
            })}
            <button
              onClick={() => setCreateOpen(true)}
              className="text-xs font-medium px-2.5 py-1.5 rounded-lg cursor-pointer transition-all bg-muted text-muted-foreground hover:bg-muted/80 ring-1 ring-transparent hover:ring-border flex items-center gap-1"
            >
              <Plus size={12} />
              Add
            </button>
          </div>

          {/* Active log content */}
          {activeLog ? (
            <div className="flex flex-col gap-4">
              {/* Side-by-side: Image | Chart */}
              <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-4">
                <TrialImage
                  photos={activeLog.photos}
                  label={getLogLabel(activeLog)}
                  onAddPhoto={() => setPhotosLog(activeLog)}
                />
                <SensoryChart
                  comparison={{
                    excludeTrialId: trialId,
                    processingType: trial?.setup?.processingType,
                    flavor: trial?.setup?.flavor,
                    thermalProcessingType: activeLog.thermalProcessingType,
                    storageTimeMinutes: activeLog.storageTimeMinutes,
                  }}
                  logMetrics={activeLog.metrics}
                  hasData={hasAnyMetric}
                  onAddData={() => setSensoryLog(activeLog)}
                />
              </div>

              {/* Delete action */}
              <div className="flex items-center justify-center">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => deleteMutation.mutate(activeLog.id)}
                  disabled={deleteMutation.isPending}
                  className="gap-1.5 text-destructive hover:text-destructive"
                >
                  <Trash2 size={14} />
                  Delete
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-12 bg-muted/20 rounded-xl ring-1 ring-border/40">
              <p className="text-sm text-muted-foreground">
                No analysis logs yet
              </p>
              <Button
                size="sm"
                onClick={() => setCreateOpen(true)}
                className="gap-1.5"
              >
                <Plus size={14} />
                Create First Log
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateLogModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        trialId={trialId}
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

      {sensoryLog && (
        <SensoryModal
          open={true}
          onOpenChange={(open) => {
            if (!open) setSensoryLog(null);
          }}
          trialId={trialId}
          log={sensoryLog}
        />
      )}
    </>
  );
};
