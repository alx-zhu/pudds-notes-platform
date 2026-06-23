import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { StorageTimeInput } from "./StorageTimeInput";
import { useAddAnalysisLog, useTrial } from "@/hooks/useTrials";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trialId: string;
}

export const CreateLogModal = ({ open, onOpenChange, trialId }: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md flex flex-col p-0 gap-0 overflow-hidden">
        {open && (
          <CreateLogForm
            trialId={trialId}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

const CreateLogForm = ({
  trialId,
  onClose,
}: {
  trialId: string;
  onClose: () => void;
}) => {
  const [storageTimeMinutes, setStorageTimeMinutes] = useState(0);

  const { data: trial } = useTrial(trialId);
  const addMutation = useAddAnalysisLog(trialId);

  // Storage time is now the sole identity of a timepoint (thermal type moved to
  // setup), so block creating a second log at a time that already exists.
  const isDuplicate = (trial?.analysisLogs ?? []).some(
    (l) => l.storageTimeMinutes === storageTimeMinutes,
  );

  const handleCreate = () => {
    if (isDuplicate) return;
    addMutation.mutate(
      { storageTimeMinutes, photos: [] },
      { onSuccess: onClose },
    );
  };

  return (
    <>
      <DialogHeader className="px-6 pt-6 pb-5 border-b border-border shrink-0">
        <DialogTitle>Add Timepoint</DialogTitle>
        <DialogDescription>
          Select a storage time to create a new analysis timepoint.
        </DialogDescription>
      </DialogHeader>

      <div className="px-6 py-6 flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-medium text-muted-foreground">
            Storage Time
          </Label>
          <StorageTimeInput
            value={storageTimeMinutes}
            onChange={setStorageTimeMinutes}
          />
          {isDuplicate && (
            <p className="text-xs text-destructive">
              A timepoint at this storage time already exists.
            </p>
          )}
        </div>
      </div>

      <div className="px-6 py-4 border-t border-border shrink-0 flex gap-3">
        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button
          size="sm"
          disabled={addMutation.isPending || isDuplicate}
          onClick={handleCreate}
        >
          {addMutation.isPending ? "Adding..." : "Add Timepoint"}
        </Button>
      </div>
    </>
  );
};
