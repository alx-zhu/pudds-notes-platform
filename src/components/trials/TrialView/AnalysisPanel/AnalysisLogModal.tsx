import { useState, useRef } from "react";
import { Camera, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import RatingDots from "@/components/trials/util/RatingDots";
import {
  useAddAnalysisLog,
  useUpdateAnalysisLog,
  useDeleteAnalysisLog,
} from "@/hooks/useTrials";
import {
  THERMAL_PROCESSING_TYPES,
  STORAGE_TIMES,
  SENSORY_METRICS,
} from "@/config/trial.config";
import type { ThermalProcessingType, StorageTime, SensoryMetricKey } from "@/config/trial.config";
import type { AnalysisLog, PartialSensoryMetrics } from "@/types/trial";
import { resizeImageToBase64 } from "@/lib/image";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trialId: string;
  existingLog?: AnalysisLog;
}

export default function AnalysisLogModal({
  open,
  onOpenChange,
  trialId,
  existingLog,
}: Props) {
  // Key resets inner form state when existingLog changes or modal reopens
  const formKey = existingLog?.id ?? "new";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        {open && (
          <AnalysisLogForm
            key={formKey}
            trialId={trialId}
            existingLog={existingLog}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function AnalysisLogForm({
  trialId,
  existingLog,
  onClose,
}: {
  trialId: string;
  existingLog?: AnalysisLog;
  onClose: () => void;
}) {
  const isEditing = Boolean(existingLog);

  const [thermalType, setThermalType] = useState<ThermalProcessingType>(
    existingLog?.thermalProcessingType ?? THERMAL_PROCESSING_TYPES[0].value,
  );
  const [storageTime, setStorageTime] = useState<StorageTime>(
    existingLog?.storageTime ?? STORAGE_TIMES[0].value,
  );
  const [photo, setPhoto] = useState<string | undefined>(existingLog?.photo);
  const [metrics, setMetrics] = useState<PartialSensoryMetrics>(
    existingLog?.metrics ?? {},
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const addMutation = useAddAnalysisLog(trialId);
  const updateMutation = useUpdateAnalysisLog(trialId);
  const deleteMutation = useDeleteAnalysisLog(trialId);

  const isPending =
    addMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  function setRating(key: SensoryMetricKey, value: number) {
    setMetrics((prev) => ({ ...prev, [key]: value || undefined }));
  }

  async function handleFileChange(file: File) {
    const dataUrl = await resizeImageToBase64(file);
    setPhoto(dataUrl);
  }

  function handleSave() {
    const input = {
      thermalProcessingType: thermalType,
      storageTime,
      photo,
      metrics,
    };

    if (isEditing && existingLog) {
      updateMutation.mutate(
        { logId: existingLog.id, input },
        { onSuccess: onClose },
      );
    } else {
      addMutation.mutate(input, { onSuccess: onClose });
    }
  }

  function handleDelete() {
    if (!existingLog) return;
    deleteMutation.mutate(existingLog.id, { onSuccess: onClose });
  }

  const ratedCount = SENSORY_METRICS.filter(
    (m) => metrics[m.key] != null && (metrics[m.key] ?? 0) >= 1,
  ).length;

  return (
    <>
      {/* Header */}
      <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
        <DialogTitle>
          {isEditing ? "Edit Analysis Log" : "New Analysis Log"}
        </DialogTitle>
        <DialogDescription>
          {isEditing
            ? "Update the thermal processing, storage time, photo, and sensory data for this log."
            : "Choose a thermal processing type and storage time, then optionally add a photo and sensory data."}
        </DialogDescription>
      </DialogHeader>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5 min-h-0">
        {/* Dropdowns row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Thermal Processing
            </Label>
            <Select
              value={thermalType}
              onValueChange={(v) => setThermalType(v as ThermalProcessingType)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {THERMAL_PROCESSING_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Storage Time
            </Label>
            <Select
              value={storageTime}
              onValueChange={(v) => setStorageTime(v as StorageTime)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STORAGE_TIMES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Photo upload */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-medium text-muted-foreground">
            Photo
          </Label>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileChange(file);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "relative w-full h-40 rounded-xl overflow-hidden flex flex-col items-center justify-center gap-2 transition-all cursor-pointer group/upload",
              photo
                ? "ring-1 ring-border/40 hover:ring-border"
                : "border-2 border-dashed border-border/60 bg-muted/20 hover:bg-muted/40 hover:border-border",
            )}
          >
            {photo ? (
              <>
                <img
                  src={photo}
                  alt="Analysis photo"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover/upload:bg-black/10 transition-colors" />
                <div className="absolute bottom-2 right-2 h-7 w-7 rounded-lg bg-card/90 backdrop-blur-sm flex items-center justify-center shadow-sm ring-1 ring-border/40 opacity-0 group-hover/upload:opacity-100 transition-opacity">
                  <Camera size={12} className="text-muted-foreground" />
                </div>
              </>
            ) : (
              <>
                <Camera
                  size={18}
                  className="text-muted-foreground/50 group-hover/upload:text-muted-foreground transition-colors"
                />
                <p className="text-xs text-muted-foreground/50 group-hover/upload:text-muted-foreground transition-colors">
                  Upload photo (optional)
                </p>
              </>
            )}
          </button>
        </div>

        {/* Sensory metrics */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-muted-foreground">
              Sensory Evaluation
            </Label>
            <span className="text-xs text-muted-foreground tabular-nums">
              {ratedCount}/{SENSORY_METRICS.length} rated
            </span>
          </div>

          {SENSORY_METRICS.map((metric) => {
            const hasValue =
              metrics[metric.key] != null && (metrics[metric.key] ?? 0) >= 1;
            return (
              <div
                key={metric.key}
                className={cn(
                  "rounded-xl px-4 py-3 flex items-start justify-between gap-6 transition-colors",
                  hasValue
                    ? "bg-blue-50/50 ring-1 ring-blue-100"
                    : "bg-muted/40 ring-1 ring-border/30",
                )}
              >
                <div className="flex flex-col gap-0.5 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {metric.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {metric.description}
                  </p>
                </div>
                <div className="shrink-0 pt-0.5">
                  <RatingDots
                    value={metrics[metric.key] ?? null}
                    max={metric.max}
                    onChange={(v) => setRating(metric.key, v)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer — pinned */}
      <div className="px-6 py-4 border-t border-border shrink-0 flex gap-3">
        {isEditing && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={isPending}
            className="text-destructive hover:text-destructive gap-1.5"
          >
            <Trash2 size={13} />
            Delete
          </Button>
        )}
        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" disabled={isPending} onClick={handleSave}>
          {isPending
            ? "Saving..."
            : isEditing
              ? "Update Log"
              : "Create Log"}
        </Button>
      </div>
    </>
  );
}
