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
import { StringCombobox } from "@/components/trials/shared/StringCombobox";
import { StorageTimeInput } from "./StorageTimeInput";
import {
  useAddAnalysisLog,
  useAllThermalProcessingTypeSuggestions,
} from "@/hooks/useTrials";

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
  const [thermalType, setThermalType] = useState("");
  const [storageTimeMinutes, setStorageTimeMinutes] = useState(0);

  const suggestions = useAllThermalProcessingTypeSuggestions();
  const addMutation = useAddAnalysisLog(trialId);

  const canCreate = thermalType.trim().length > 0;

  const handleCreate = () => {
    if (!canCreate) return;
    addMutation.mutate(
      {
        thermalProcessingType: thermalType.trim(),
        storageTimeMinutes,
        photos: [],
        metrics: {},
        comments: {},
      },
      { onSuccess: onClose },
    );
  };

  return (
    <>
      <DialogHeader className="px-6 pt-6 pb-5 border-b border-border shrink-0">
        <DialogTitle>New Analysis Log</DialogTitle>
        <DialogDescription>
          Select a thermal processing type and storage time to create a new log.
        </DialogDescription>
      </DialogHeader>

      <div className="px-6 py-6 flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-medium text-muted-foreground">
            Thermal Processing
          </Label>
          <StringCombobox
            value={thermalType}
            onChange={setThermalType}
            suggestions={suggestions}
            placeholder="Select or type..."
            searchPlaceholder="Search or create new..."
            emptyMessage="No matching types."
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-medium text-muted-foreground">
            Storage Time
          </Label>
          <StorageTimeInput
            value={storageTimeMinutes}
            onChange={setStorageTimeMinutes}
          />
        </div>
      </div>

      <div className="px-6 py-4 border-t border-border shrink-0 flex gap-3">
        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button
          size="sm"
          disabled={!canCreate || addMutation.isPending}
          onClick={handleCreate}
        >
          {addMutation.isPending ? "Creating..." : "Create Log"}
        </Button>
      </div>
    </>
  );
};
