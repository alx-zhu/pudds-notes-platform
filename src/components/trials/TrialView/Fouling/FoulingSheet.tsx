import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
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

export const FoulingSheet = ({
  open,
  onOpenChange,
  trialId,
  initialFouling,
}: Props) => {
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
    mutation.mutate(fouling, { onSuccess: () => onOpenChange(false) });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[360px] flex flex-col gap-0 p-0">
        <SheetHeader className="px-6 pt-6 pb-5 border-b border-border shrink-0">
          <SheetTitle>Fouling</SheetTitle>
          <SheetDescription>Trial-level outcome</SheetDescription>
        </SheetHeader>

        <div className="px-6 py-6 flex flex-col gap-5 flex-1">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Did the product foul?
            </Label>
            <ToggleGroup
              type="single"
              value={didFoul === null ? "" : didFoul ? "yes" : "no"}
              onValueChange={(v) => {
                if (v === "yes") setDidFoul(true);
                else if (v === "no") setDidFoul(false);
              }}
              className="justify-start"
            >
              <ToggleGroupItem value="yes" className="text-xs">
                Did foul
              </ToggleGroupItem>
              <ToggleGroupItem value="no" className="text-xs">
                Did not foul
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {didFoul === true && (
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Time to fouling
              </Label>
              <StorageTimeInput
                value={timeToFoulingMinutes}
                onChange={setTimeToFoulingMinutes}
              />
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-border shrink-0 flex gap-3">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onOpenChange(false)}
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
      </SheetContent>
    </Sheet>
  );
};
