import { useState, useRef, useEffect } from "react";
import { Camera, X, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useUpdateAnalysisLog } from "@/hooks/useTrials";
import { getLogLabel } from "@/lib/analysisLog";
import { resizeImageToFile } from "@/lib/image";
import {
  uploadTrialMedia,
  deleteTrialMedia,
  resolveMediaSrc,
  isVideoSrc,
  validateMediaFile,
} from "@/lib/storage";
import { cn } from "@/lib/utils";
import type { AnalysisLog } from "@/types/trial";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trialId: string;
  log: AnalysisLog;
}

/** Already-saved photo (storage path or legacy base64) vs. a pending pick. */
type Item =
  | { kind: "saved"; src: string }
  | { kind: "pending"; id: string; file: File; url: string };

export const PhotosModal = ({ open, onOpenChange, trialId, log }: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        {open && (
          <PhotosForm
            trialId={trialId}
            log={log}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

const PhotosForm = ({
  trialId,
  log,
  onClose,
}: {
  trialId: string;
  log: AnalysisLog;
  onClose: () => void;
}) => {
  const [items, setItems] = useState<Item[]>(
    (log.photos ?? []).map((src) => ({ kind: "saved", src })),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateMutation = useUpdateAnalysisLog(trialId);

  // Revoke object URLs held by pending picks on unmount (e.g. Cancel).
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  });
  useEffect(
    () => () => {
      itemsRef.current.forEach((it) => {
        if (it.kind === "pending") URL.revokeObjectURL(it.url);
      });
    },
    [],
  );

  const handlePick = (files: FileList) => {
    const next: Item[] = [];
    for (const file of Array.from(files)) {
      const invalid = validateMediaFile(file);
      if (invalid) {
        setError(invalid);
        continue;
      }
      next.push({
        kind: "pending",
        id: crypto.randomUUID(),
        file,
        url: URL.createObjectURL(file),
      });
    }
    if (next.length) {
      setError(null);
      setItems((prev) => [...prev, ...next]);
    }
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find(
        (it) => (it.kind === "pending" ? it.id : it.src) === id,
      );
      if (target?.kind === "pending") URL.revokeObjectURL(target.url);
      return prev.filter(
        (it) => (it.kind === "pending" ? it.id : it.src) !== id,
      );
    });
  };

  // Upload happens here, on Save — not when a photo is picked. Cancelling (or
  // removing a pick) before Save uploads nothing, so it leaves no orphans.
  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      const pending = items.filter(
        (it): it is Extract<Item, { kind: "pending" }> => it.kind === "pending",
      );
      const uploadedPaths = await Promise.all(
        pending.map(async (p) => {
          // Images get resized; videos upload as-is (no canvas resize).
          const toUpload = p.file.type.startsWith("image/")
            ? await resizeImageToFile(p.file)
            : p.file;
          const { path } = await uploadTrialMedia(toUpload, trialId);
          return path;
        }),
      );

      // Reassemble photos[] in display order, swapping each pick for its path.
      const queue = [...uploadedPaths];
      const photos = items.map((it) =>
        it.kind === "saved" ? it.src : queue.shift()!,
      );

      // Existing storage photos removed in this session (skip legacy base64).
      const kept = new Set(photos);
      const removedPaths = (log.photos ?? []).filter(
        (p) => !p.startsWith("data:") && !kept.has(p),
      );

      // Persist first; then best-effort storage cleanup (an orphan is harmless,
      // a broken reference is not).
      await updateMutation.mutateAsync({ logId: log.id, input: { photos } });
      if (removedPaths.length) {
        try {
          await deleteTrialMedia(removedPaths);
        } catch {
          /* orphaned storage object — storage cost only */
        }
      }
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save photos.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <DialogHeader className="px-6 pt-6 pb-5 border-b border-border shrink-0">
        <DialogTitle>Photos &amp; video</DialogTitle>
        <DialogDescription>{getLogLabel(log)}</DialogDescription>
      </DialogHeader>

      <div className="flex-1 overflow-y-auto min-h-0 px-6 py-5 bg-muted/50">
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          ref={fileInputRef}
          onChange={(e) => {
            if (e.target.files?.length) handlePick(e.target.files);
            e.target.value = "";
          }}
        />
        <div className="grid grid-cols-3 gap-2">
          {items.map((it) => {
            const id = it.kind === "pending" ? it.id : it.src;
            const src = it.kind === "pending" ? it.url : resolveMediaSrc(it.src);
            const isVideo =
              it.kind === "pending"
                ? it.file.type.startsWith("video/")
                : isVideoSrc(it.src);
            return (
              <div key={id} className="relative aspect-square group/photo">
                {isVideo ? (
                  <video
                    src={src}
                    className="w-full h-full object-cover rounded-xl bg-muted"
                    muted
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <img
                    src={src}
                    alt=""
                    className="w-full h-full object-cover rounded-xl"
                  />
                )}
                {isVideo && (
                  <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="h-6 w-6 rounded-full bg-black/55 flex items-center justify-center">
                      <Play size={10} className="text-white fill-white" />
                    </span>
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeItem(id)}
                  aria-label="Remove media"
                  className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-opacity cursor-pointer"
                >
                  <X size={10} className="text-white" />
                </button>
              </div>
            );
          })}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={saving}
            className={cn(
              "rounded-xl border-2 border-dashed border-border hover:bg-muted flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer group/add disabled:opacity-60 disabled:cursor-default",
              items.length === 0 ? "col-span-3 py-10" : "aspect-square",
            )}
          >
            <Camera
              size={items.length === 0 ? 20 : 16}
              className="text-muted-foreground group-hover/add:text-foreground transition-colors"
            />
            <span
              className={cn(
                "text-muted-foreground group-hover/add:text-foreground transition-colors",
                items.length === 0 ? "text-sm" : "text-[10px]",
              )}
            >
              {items.length === 0 ? "Add photos or video" : "Add"}
            </span>
          </button>
        </div>

        {error && <p className="mt-3 text-xs text-destructive">{error}</p>}
      </div>

      <div className="px-6 py-4 border-t border-border shrink-0 flex gap-3">
        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button size="sm" disabled={saving} onClick={handleSave}>
          {saving ? "Saving…" : "Save Photos"}
        </Button>
      </div>
    </>
  );
};
