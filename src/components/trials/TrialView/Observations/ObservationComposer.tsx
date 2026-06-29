import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { DialogConfirm } from "@/components/shared/DialogConfirm";
import { MediaGrid } from "@/components/trials/shared/media/MediaGrid";
import { useMediaDraft } from "@/hooks/useMediaDraft";
import { useUpsertObservation } from "@/hooks/useTrials";
import { useDeleteMedia } from "@/hooks/useTrialMedia";
import type { Observation } from "@/types/trial";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trialId: string;
  observation?: Observation; // present = edit
  onDelete: () => void;
}

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
  const [confirming, setConfirming] = useState(false);

  const draft = useMediaDraft(observation?.media ?? [], trialId);
  const upsert = useUpsertObservation(trialId);
  const deleteMedia = useDeleteMedia();

  const saving = draft.isUploading || upsert.isPending;
  const canSave = caption.trim().length > 0 || draft.items.length > 0;

  const handleSave = async () => {
    draft.setError(null);

    let result;
    try {
      result = await draft.commitUploads();
    } catch (e) {
      draft.setError(e instanceof Error ? e.message : "Upload failed.");
      return;
    }

    try {
      // Persist first; then best-effort storage cleanup (orphans are harmless,
      // a broken reference is not).
      await upsert.mutateAsync({
        id: observation?.id,
        caption: caption.trim() || undefined,
        media: result.media,
      });
    } catch (e) {
      draft.setError(e instanceof Error ? e.message : "Save failed.");
      return;
    }
    if (result.removedPaths.length) {
      try {
        await deleteMedia.mutateAsync(result.removedPaths);
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

        <MediaGrid
          items={draft.items}
          onAddFiles={draft.addFiles}
          onRemove={draft.removeItem}
        />

        {draft.error && <p className="text-xs text-destructive">{draft.error}</p>}
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
