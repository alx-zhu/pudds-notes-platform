import { useState, useRef, useMemo } from "react";
import {
  Camera,
  Trash2,
  X,
  ImageIcon,
  BarChart3,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
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
import { RatingDots } from "@/components/trials/util/RatingDots";
import {
  useAddAnalysisLog,
  useUpdateAnalysisLog,
  useDeleteAnalysisLog,
} from "@/hooks/useTrials";
import {
  THERMAL_PROCESSING_TYPES,
  STORAGE_TIMES,
  SENSORY_METRICS,
  SENSORY_METRIC_GROUPS,
} from "@/config/trial.config";
import type {
  ThermalProcessingType,
  StorageTime,
  SensoryMetricKey,
} from "@/config/trial.config";
import type {
  AnalysisLog,
  PartialSensoryMetrics,
  PartialSensoryComments,
} from "@/types/trial";
import { resizeImageToBase64 } from "@/lib/image";
import { cn } from "@/lib/utils";

type Tab = "photo" | "sensory";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trialId: string;
  existingLog?: AnalysisLog;
  allLogs?: AnalysisLog[];
  initialTab?: Tab;
}

export const AnalysisLogModal = ({
  open,
  onOpenChange,
  trialId,
  existingLog,
  allLogs = [],
  initialTab,
}: Props) => {
  const formKey = existingLog?.id ?? "new";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        {open && (
          <AnalysisLogForm
            key={formKey}
            trialId={trialId}
            existingLog={existingLog}
            allLogs={allLogs}
            onClose={() => onOpenChange(false)}
            initialTab={initialTab}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

const findMatchingLog = (
  logs: AnalysisLog[],
  thermalType: ThermalProcessingType,
  storageTime: StorageTime,
  excludeId?: string,
): AnalysisLog | undefined => {
  return logs.find(
    (l) =>
      l.thermalProcessingType === thermalType &&
      l.storageTime === storageTime &&
      l.id !== excludeId,
  );
};

const AnalysisLogForm = ({
  trialId,
  existingLog,
  allLogs,
  onClose,
  initialTab,
}: {
  trialId: string;
  existingLog?: AnalysisLog;
  allLogs: AnalysisLog[];
  onClose: () => void;
  initialTab?: Tab;
}) => {
  // On open: if no existingLog, check if a log already exists for the default selectors
  const initialLog = useMemo(() => {
    if (existingLog) return existingLog;
    return findMatchingLog(
      allLogs,
      THERMAL_PROCESSING_TYPES[0].value,
      STORAGE_TIMES[0].value,
    );
  }, [existingLog, allLogs]);

  const [activeLogId, setActiveLogId] = useState<string | undefined>(
    initialLog?.id,
  );
  const isEditing = Boolean(activeLogId);

  const [thermalType, setThermalType] = useState<ThermalProcessingType>(
    initialLog?.thermalProcessingType ?? THERMAL_PROCESSING_TYPES[0].value,
  );
  const [storageTime, setStorageTime] = useState<StorageTime>(
    initialLog?.storageTime ?? STORAGE_TIMES[0].value,
  );
  const [photos, setPhotos] = useState<string[]>(initialLog?.photos ?? []);
  const [metrics, setMetrics] = useState<PartialSensoryMetrics>(
    initialLog?.metrics ?? {},
  );
  const [comments, setComments] = useState<PartialSensoryComments>(
    initialLog?.comments ?? {},
  );
  const [expandedMetric, setExpandedMetric] =
    useState<SensoryMetricKey | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>(initialTab ?? "photo");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const addMutation = useAddAnalysisLog(trialId);
  const updateMutation = useUpdateAnalysisLog(trialId);
  const deleteMutation = useDeleteAnalysisLog(trialId);

  const isPending =
    addMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  const switchToLog = (log: AnalysisLog) => {
    setActiveLogId(log.id);
    setThermalType(log.thermalProcessingType);
    setStorageTime(log.storageTime);
    setPhotos(log.photos ?? []);
    setMetrics(log.metrics);
    setComments(log.comments ?? {});
  };

  const handleThermalChange = (v: ThermalProcessingType) => {
    const match = findMatchingLog(allLogs, v, storageTime, activeLogId);
    if (match) {
      switchToLog(match);
    } else {
      setThermalType(v);
      setActiveLogId(undefined);
      setPhotos([]);
      setMetrics({});
      setComments({});
    }
  };

  const handleStorageChange = (v: StorageTime) => {
    const match = findMatchingLog(allLogs, thermalType, v, activeLogId);
    if (match) {
      switchToLog(match);
    } else {
      setStorageTime(v);
      setActiveLogId(undefined);
      setPhotos([]);
      setMetrics({});
      setComments({});
    }
  };

  const setRating = (key: SensoryMetricKey, value: number) => {
    setMetrics((prev) => ({ ...prev, [key]: value || undefined }));
  };

  const handleFileChange = async (files: FileList) => {
    const newPhotos = await Promise.all(
      Array.from(files).map((f) => resizeImageToBase64(f)),
    );
    setPhotos((prev) => [...prev, ...newPhotos]);
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const input = {
      thermalProcessingType: thermalType,
      storageTime,
      photos,
      metrics,
      comments,
    };

    if (isEditing && activeLogId) {
      updateMutation.mutate(
        { logId: activeLogId, input },
        { onSuccess: onClose },
      );
    } else {
      addMutation.mutate(input, { onSuccess: onClose });
    }
  };

  const handleDelete = () => {
    if (!activeLogId) return;
    deleteMutation.mutate(activeLogId, { onSuccess: onClose });
  };

  const ratedCount = SENSORY_METRICS.filter(
    (m) => metrics[m.key] != null && (metrics[m.key] ?? 0) >= 1,
  ).length;

  const photoCount = photos.length;

  return (
    <>
      {/* Header */}
      <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
        <div className="flex items-center gap-2.5">
          <DialogTitle>
            {isEditing ? "Edit Analysis Log" : "New Analysis Log"}
          </DialogTitle>
          {isEditing && (
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
              Existing
            </span>
          )}
        </div>
        <DialogDescription>
          {isEditing
            ? "Update the thermal processing, storage time, photo, and sensory data for this log."
            : "Choose a thermal processing type and storage time, then optionally add a photo and sensory data."}
        </DialogDescription>
      </DialogHeader>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {/* Selectors */}
        <div className="px-6 pb-5 grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Thermal Processing
            </Label>
            <Select
              value={thermalType}
              onValueChange={(v) =>
                handleThermalChange(v as ThermalProcessingType)
              }
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
              onValueChange={(v) => handleStorageChange(v as StorageTime)}
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

        {/* Tab bar */}
        <div className="flex gap-6 px-6 border-b border-border">
          <button
            type="button"
            onClick={() => setActiveTab("photo")}
            className={cn(
              "flex items-center gap-1.5 text-sm font-medium pb-2.5 border-b-2 -mb-px transition-colors cursor-pointer",
              activeTab === "photo"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <ImageIcon size={14} />
            Photos
            {photoCount > 0 && (
              <span className="text-xs tabular-nums text-muted-foreground">
                {photoCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("sensory")}
            className={cn(
              "flex items-center gap-1.5 text-sm font-medium pb-2.5 border-b-2 -mb-px transition-colors cursor-pointer",
              activeTab === "sensory"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <BarChart3 size={14} />
            Sensory Evaluation
            {ratedCount > 0 && (
              <span className="text-xs tabular-nums text-muted-foreground">
                {ratedCount}/{SENSORY_METRICS.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab content */}
        {activeTab === "photo" ? (
          <div className="px-6 py-5 bg-muted/50">
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files?.length) handleFileChange(e.target.files);
                e.target.value = "";
              }}
            />
            <div className="grid grid-cols-3 gap-2">
              {photos.map((src, i) => (
                <div key={i} className="relative aspect-square group/photo">
                  <img
                    src={src}
                    alt={`Photo ${i + 1}`}
                    className="w-full h-full object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-opacity cursor-pointer"
                  >
                    <X size={10} className="text-white" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "rounded-xl border-2 border-dashed border-border hover:bg-muted flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer group/add",
                  photos.length === 0 ? "col-span-3 py-10" : "aspect-square",
                )}
              >
                <Camera
                  size={photos.length === 0 ? 20 : 16}
                  className="text-muted-foreground group-hover/add:text-foreground transition-colors"
                />
                <span
                  className={cn(
                    "text-muted-foreground group-hover/add:text-foreground transition-colors",
                    photos.length === 0 ? "text-sm" : "text-[10px]",
                  )}
                >
                  {photos.length === 0 ? "Add photos" : "Add"}
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="px-6 py-2 bg-muted/50">
            {SENSORY_METRIC_GROUPS.map((group) => {
              const groupMetrics = group.keys.map(
                (key) => SENSORY_METRICS.find((m) => m.key === key)!,
              );
              const ratedInGroup = groupMetrics.filter(
                (m) =>
                  metrics[m.key] != null && (metrics[m.key] ?? 0) >= 1,
              ).length;

              return (
                <div key={group.label}>
                  <div className="flex items-center justify-between py-2.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {group.label}
                    </span>
                    <span className="text-[10px] tabular-nums text-muted-foreground">
                      {ratedInGroup}/{groupMetrics.length}
                    </span>
                  </div>

                  <div className="divide-y divide-border/40">
                    {groupMetrics.map((metric) => {
                      const isExpanded = expandedMetric === metric.key;
                      const hasComment = Boolean(
                        comments[metric.key]?.trim(),
                      );

                      return (
                        <Collapsible
                          key={metric.key}
                          open={isExpanded}
                          onOpenChange={(open) =>
                            setExpandedMetric(
                              open ? metric.key : null,
                            )
                          }
                        >
                          <div className="py-3 flex items-center justify-between gap-4">
                            <CollapsibleTrigger asChild>
                              <button
                                type="button"
                                className="flex items-center gap-2 min-w-0 cursor-pointer"
                              >
                                <ChevronRight
                                  size={14}
                                  className={cn(
                                    "text-muted-foreground transition-transform shrink-0",
                                    isExpanded && "rotate-90",
                                  )}
                                />
                                <span className="text-sm font-medium text-foreground truncate">
                                  {metric.label}
                                </span>
                                {hasComment && (
                                  <MessageSquare
                                    size={12}
                                    className="text-muted-foreground shrink-0"
                                  />
                                )}
                              </button>
                            </CollapsibleTrigger>
                            <div className="shrink-0">
                              <RatingDots
                                value={metrics[metric.key] ?? null}
                                max={metric.max}
                                onChange={(v) =>
                                  setRating(metric.key, v)
                                }
                              />
                            </div>
                          </div>

                          <CollapsibleContent>
                            <div className="pb-3 pl-7 pr-1 flex flex-col gap-2">
                              <p className="text-xs text-muted-foreground">
                                {metric.description}
                              </p>
                              <Textarea
                                placeholder="Add a comment..."
                                value={comments[metric.key] ?? ""}
                                onChange={(e) =>
                                  setComments((prev) => ({
                                    ...prev,
                                    [metric.key]:
                                      e.target.value || undefined,
                                  }))
                                }
                                className="min-h-[60px] text-sm resize-none"
                              />
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
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
          {isPending ? "Saving..." : isEditing ? "Update Log" : "Create Log"}
        </Button>
      </div>
    </>
  );
};
