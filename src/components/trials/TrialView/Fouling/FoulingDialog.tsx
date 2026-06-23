import { useState } from "react";
import { Flame } from "lucide-react";
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
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { StorageTimeInput } from "@/components/trials/TrialView/TrialAnalysis/CreateLogModal/StorageTimeInput";
import { useUpsertFouling } from "@/hooks/useTrials";
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
      <DialogContent className="max-w-sm flex flex-col p-0 gap-0 overflow-hidden">
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
  const [didFoul, setDidFoul] = useState<boolean | null>(
    initialFouling != null ? initialFouling.didFoul : null,
  );
  const [timeToFoulingMinutes, setTimeToFoulingMinutes] = useState<number>(
    initialFouling?.timeToFoulingMinutes ?? 0,
  );

  const mutation = useUpsertFouling(trialId);

  const handleSave = () => {
    if (didFoul === null) return;
    const fouling: FoulingResult = didFoul
      ? { didFoul: true, timeToFoulingMinutes }
      : { didFoul: false };
    mutation.mutate(fouling, { onSuccess: onClose });
  };

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

      <div className="px-6 py-6 flex flex-col gap-5">
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

        {/* Placeholder when nothing selected yet */}
        {didFoul === null && (
          <p className="text-xs text-muted-foreground text-center py-2">
            Select an outcome above to continue.
          </p>
        )}
      </div>

      <div className="px-6 py-4 border-t border-border shrink-0 flex gap-3">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={onClose}
          disabled={mutation.isPending}
        >
          Cancel
        </Button>
        <Button
          size="sm"
          className="flex-1"
          onClick={handleSave}
          disabled={mutation.isPending || didFoul === null}
        >
          {mutation.isPending ? "Saving..." : "Save"}
        </Button>
      </div>
    </>
  );
};
