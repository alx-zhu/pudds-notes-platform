import { useEffect, useRef, useState } from "react";
import { ImagePlus, X, Play, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { getMediaUrl } from "@/lib/storage";
import { DialogConfirm } from "@/components/shared/DialogConfirm";
import { useUpsertObservation } from "@/hooks/useTrials";
import { useUploadMedia, useDeleteMedia } from "@/hooks/useTrialMedia";
import type {
  Observation,
  ObservationMedia,
  ObservationMediaType,
} from "@/types/trial";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trialId: string;
  observation?: Observation; // present = edit
  onDelete: () => void;
}

const MAX_BYTES = 50 * 1024 * 1024;

/** Already-persisted media (has a storage path) vs. a pending in-memory pick. */
type Item =
  | { kind: "saved"; media: ObservationMedia }
  | {
      kind: "pending";
      id: string;
      file: File;
      url: string;
      type: ObservationMediaType;
    };

export const ObservationComposer = ({
  open,
  onOpenChange,
  trialId,
  observation,
  onDelete,
}: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-lg max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden"
        showCloseButton={false}
      >
        {open && (
          <ComposerForm
            trialId={trialId}
            observation={observation}
            onClose={() => onOpenChange(false)}
            onDelete={onDelete}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

const ComposerForm = ({
  trialId,
  observation,
  onClose,
  onDelete,
}: {
  trialId: string;
  observation?: Observation;
  onClose: () => void;
  onDelete: () => void;
}) => {
  const isEdit = Boolean(observation);
  const [caption, setCaption] = useState(observation?.caption ?? "");
  const [items, setItems] = useState<Item[]>(
    (observation?.media ?? []).map((media) => ({ kind: "saved", media })),
  );
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const upsert = useUpsertObservation(trialId);
  const uploadMedia = useUploadMedia(trialId);
  const deleteMedia = useDeleteMedia();

  // Revoke any object URLs still held by pending picks on unmount.
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

  const saving = uploadMedia.isPending || upsert.isPending;
  const canSave = caption.trim().length > 0 || items.length > 0;

  const handlePick = (files: FileList) => {
    const next: Item[] = [];
    for (const file of Array.from(files)) {
      if (!/^(image|video)\//.test(file.type)) {
        setError("Only images and videos are supported.");
        continue;
      }
      if (file.size > MAX_BYTES) {
        setError("That file is over 50 MB.");
        continue;
      }
      next.push({
        kind: "pending",
        id: crypto.randomUUID(),
        file,
        url: URL.createObjectURL(file),
        type: file.type.startsWith("video") ? "video" : "image",
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
        (it) => (it.kind === "pending" ? it.id : it.media.id) === id,
      );
      if (target?.kind === "pending") URL.revokeObjectURL(target.url);
      return prev.filter(
        (it) => (it.kind === "pending" ? it.id : it.media.id) !== id,
      );
    });
  };

  const handleSave = async () => {
    setError(null);
    const pending = items.filter(
      (it): it is Extract<Item, { kind: "pending" }> => it.kind === "pending",
    );

    let uploaded;
    try {
      uploaded = await uploadMedia.mutateAsync(pending.map((p) => p.file));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
      return;
    }

    // Reassemble media[] in display order, swapping pending picks for uploads.
    const queue = [...uploaded];
    const media: ObservationMedia[] = items.map((it) => {
      if (it.kind === "saved") return it.media;
      const up = queue.shift()!;
      return { id: it.id, path: up.path, type: up.type };
    });

    const savedPaths = new Set(media.map((m) => m.path));
    const removedPaths = (observation?.media ?? [])
      .map((m) => m.path)
      .filter((p) => !savedPaths.has(p));

    try {
      // Persist first; then best-effort storage cleanup (orphans are harmless,
      // a broken reference is not).
      await upsert.mutateAsync({
        id: observation?.id,
        caption: caption.trim() || undefined,
        media,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
      return;
    }
    if (removedPaths.length) {
      try {
        await deleteMedia.mutateAsync(removedPaths);
      } catch {
        /* orphaned storage object — storage cost only */
      }
    }
    onClose();
  };

  if (confirming) {
    return (
      <DialogConfirm
        title="Delete observation?"
        description="This will permanently delete this observation along with its photos and videos. This action cannot be undone."
        onConfirm={onDelete}
        onCancel={() => setConfirming(false)}
      />
    );
  }

  return (
    <>
      <DialogHeader className="px-6 pt-6 pb-5 border-b border-border shrink-0">
        <DialogTitle>{isEdit ? "Edit observation" : "New observation"}</DialogTitle>
        <DialogDescription>
          Add a note, photos, or video from the trial.
        </DialogDescription>
      </DialogHeader>

      <div className="flex-1 overflow-y-auto min-h-0 px-6 py-5 flex flex-col gap-4">
        <Textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="What did you observe? (optional if you add media)"
          className="min-h-24 resize-none"
        />

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
            const id = it.kind === "pending" ? it.id : it.media.id;
            const type = it.kind === "pending" ? it.type : it.media.type;
            const src =
              it.kind === "pending" ? it.url : getMediaUrl(it.media.path);
            return (
              <div key={id} className="relative aspect-square group/media">
                {type === "video" ? (
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
                    className="w-full h-full object-cover rounded-xl bg-muted"
                  />
                )}
                {type === "video" && (
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
                  className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/media:opacity-100 transition-opacity cursor-pointer"
                >
                  <X size={10} className="text-white" />
                </button>
              </div>
            );
          })}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "rounded-xl border-2 border-dashed border-border hover:bg-muted flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer group/add",
              items.length === 0 ? "col-span-3 py-10" : "aspect-square",
            )}
          >
            <ImagePlus
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

        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      <div className="px-6 py-4 border-t border-border shrink-0 flex items-center gap-3">
        {isEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirming(true)}
            disabled={saving}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1.5"
          >
            <Trash2 size={14} />
            Delete
          </Button>
        )}
        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button size="sm" onClick={handleSave} disabled={saving || !canSave}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </>
  );
};
