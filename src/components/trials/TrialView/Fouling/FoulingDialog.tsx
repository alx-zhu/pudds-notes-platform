import { useState } from "react";
import { Flame, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { DialogConfirm } from "@/components/shared/DialogConfirm";
import { MediaGrid } from "@/components/trials/shared/media/MediaGrid";
import { StorageTimeInput } from "@/components/trials/TrialView/TrialAnalysis/CreateLogModal/StorageTimeInput";
import { useMediaDraft } from "@/hooks/useMediaDraft";
import { useUpsertFouling } from "@/hooks/useTrials";
import { useDeleteMedia } from "@/hooks/useTrialMedia";
import type { FoulingResult } from "@/types/trial";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trialId: string;
  initialFouling?: FoulingResult;
}

export const FoulingDialog = ({
  open,
  onOpenChange,
  trialId,
  initialFouling,
}: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden"
        showCloseButton={false}
      >
        {open && (
          <FoulingForm
            trialId={trialId}
            initialFouling={initialFouling}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

const FoulingForm = ({
  trialId,
  initialFouling,
  onClose,
}: {
  trialId: string;
  initialFouling?: FoulingResult;
  onClose: () => void;
}) => {
  const isEdit = Boolean(initialFouling);
  const [didFoul, setDidFoul] = useState<boolean | null>(
    initialFouling != null ? initialFouling.didFoul : null,
  );
  const [timeToFoulingMinutes, setTimeToFoulingMinutes] = useState<number>(
    initialFouling?.timeToFoulingMinutes ?? 0,
  );
  const [notes, setNotes] = useState(initialFouling?.notes ?? "");
  const [confirming, setConfirming] = useState(false);

  const draft = useMediaDraft(initialFouling?.media ?? [], trialId);
  const mutation = useUpsertFouling(trialId);
  const deleteMedia = useDeleteMedia();

  const saving = draft.isUploading || mutation.isPending;

  const handleSave = async () => {
    if (didFoul === null) return;
    draft.setError(null);

    let result;
    try {
      result = await draft.commitUploads();
    } catch (e) {
      draft.setError(e instanceof Error ? e.message : "Upload failed.");
      return;
    }

    const trimmedNotes = notes.trim() || undefined;
    const fouling: FoulingResult = didFoul
      ? {
          didFoul: true,
          timeToFoulingMinutes,
          notes: trimmedNotes,
          media: result.media,
        }
      : { didFoul: false, notes: trimmedNotes, media: result.media };

    try {
      // Persist first; then best-effort storage cleanup (orphans are harmless,
      // a broken reference is not).
      await mutation.mutateAsync(fouling);
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

  const handleClear = async () => {
    try {
      await mutation.mutateAsync(undefined);
    } catch (e) {
      draft.setError(e instanceof Error ? e.message : "Clear failed.");
      setConfirming(false);
      return;
    }
    // Persist-then-delete: the record is gone, now drop its stored media.
    const paths = (initialFouling?.media ?? []).map((m) => m.path);
    if (paths.length) {
      try {
        await deleteMedia.mutateAsync(paths);
      } catch {
        /* orphaned storage object — storage cost only */
      }
    }
    onClose();
  };

  if (confirming) {
    return (
      <DialogConfirm
        title="Clear fouling result?"
        description="This will permanently delete the fouling outcome along with its notes, photos, and videos. This action cannot be undone."
        onConfirm={handleClear}
        onCancel={() => setConfirming(false)}
      />
    );
  }

  return (
    <>
      <DialogHeader className="px-6 pt-6 pb-5 border-b border-border shrink-0">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
            <Flame size={16} className="text-amber-600" />
          </div>
          <DialogTitle>Fouling Result</DialogTitle>
        </div>
        <DialogDescription>
          Record whether the product fouled during this run.
        </DialogDescription>
      </DialogHeader>

      <div className="flex-1 overflow-y-auto min-h-0 px-6 py-6 flex flex-col gap-5">
        {/* Outcome toggle */}
        <div className="flex flex-col gap-2">
          <Label className="text-xs font-medium text-muted-foreground">
            Outcome
          </Label>
          <ToggleGroup
            type="single"
            value={didFoul === null ? "" : didFoul ? "yes" : "no"}
            onValueChange={(v) => {
              if (v === "yes") setDidFoul(true);
              else if (v === "no") setDidFoul(false);
            }}
            className="grid grid-cols-2 gap-2 w-full"
          >
            <ToggleGroupItem
              value="yes"
              className="w-full h-16 flex flex-col gap-1 rounded-lg border data-[state=on]:border-destructive data-[state=on]:bg-destructive/5 data-[state=on]:text-destructive"
            >
              <div className="h-2 w-2 rounded-full bg-current" />
              <span className="text-xs font-medium">Did foul</span>
            </ToggleGroupItem>
            <ToggleGroupItem
              value="no"
              className="w-full h-16 flex flex-col gap-1 rounded-lg border data-[state=on]:border-foreground data-[state=on]:bg-muted"
            >
              <div className="h-2 w-2 rounded-full bg-muted-foreground/40" />
              <span className="text-xs font-medium">Did not foul</span>
            </ToggleGroupItem>
          </ToggleGroup>
          {didFoul === null && (
            <p className="text-xs text-muted-foreground">
              Select an outcome to save.
            </p>
          )}
        </div>

        {/* Time field — only when did foul */}
        {didFoul === true && (
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-medium text-muted-foreground">
              Time to fouling
            </Label>
            <StorageTimeInput
              value={timeToFoulingMinutes}
              onChange={setTimeToFoulingMinutes}
            />
          </div>
        )}

        {/* Notes — any outcome */}
        <div className="flex flex-col gap-2">
          <Label className="text-xs font-medium text-muted-foreground">
            Notes <span className="font-normal">(optional)</span>
          </Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What did you see? (e.g. film on the heat-exchanger wall, flow drop)"
            className="min-h-20 resize-none"
          />
        </div>

        {/* Media — any outcome */}
        <div className="flex flex-col gap-2">
          <Label className="text-xs font-medium text-muted-foreground">
            Photos &amp; video <span className="font-normal">(optional)</span>
          </Label>
          <MediaGrid
            items={draft.items}
            onAddFiles={draft.addFiles}
            onRemove={draft.removeItem}
          />
        </div>

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
            Clear fouling
          </Button>
        )}
        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={saving || didFoul === null}
        >
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </>
  );
};
