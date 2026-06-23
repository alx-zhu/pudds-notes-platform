import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useUpsertMeasurements } from "@/hooks/useTrials";
import type { PhysicalMeasurements } from "@/types/trial";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trialId: string;
  logId: string;
  logLabel: string;
  initialMeasurements?: PhysicalMeasurements;
}

export const PhysicalMeasurementsSheet = ({
  open,
  onOpenChange,
  trialId,
  logId,
  logLabel,
  initialMeasurements,
}: Props) => {
  const [bostwickTime, setBostwickTime] = useState(
    initialMeasurements?.bostwickTime?.toString() ?? "",
  );
  const [bostwickDistance, setBostwickDistance] = useState(
    initialMeasurements?.bostwickDistance?.toString() ?? "",
  );
  const [pH, setPH] = useState(initialMeasurements?.pH?.toString() ?? "");
  const [syneresis, setSyneresis] = useState(
    initialMeasurements?.syneresis?.toString() ?? "",
  );

  const upsertMutation = useUpsertMeasurements(trialId);

  const buildMeasurements = (): PhysicalMeasurements => ({
    ...(bostwickTime.trim() !== "" ? { bostwickTime: parseFloat(bostwickTime) } : {}),
    ...(bostwickDistance.trim() !== "" ? { bostwickDistance: parseFloat(bostwickDistance) } : {}),
    ...(pH.trim() !== "" ? { pH: parseFloat(pH) } : {}),
    ...(syneresis.trim() !== "" ? { syneresis: parseFloat(syneresis) } : {}),
  });

  const handleSave = () => {
    upsertMutation.mutate(
      { logId, measurements: buildMeasurements() },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[360px] flex flex-col gap-0 p-0">
        <SheetHeader className="px-6 pt-6 pb-5 border-b border-border shrink-0">
          <SheetTitle>Physical Measurements</SheetTitle>
          <SheetDescription>{logLabel}</SheetDescription>
        </SheetHeader>

        <div className="px-6 py-6 flex flex-col gap-5 flex-1">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Bostwick Time (s)
            </Label>
            <Input
              type="number"
              step="0.1"
              value={bostwickTime}
              onChange={(e) => setBostwickTime(e.target.value)}
              placeholder="e.g. 7.2"
              className="h-9 bg-muted border-0"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Bostwick Distance (cm)
            </Label>
            <Input
              type="number"
              step="0.1"
              value={bostwickDistance}
              onChange={(e) => setBostwickDistance(e.target.value)}
              placeholder="e.g. 14.5"
              className="h-9 bg-muted border-0"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              pH
            </Label>
            <Input
              type="number"
              step="0.01"
              value={pH}
              onChange={(e) => setPH(e.target.value)}
              placeholder="e.g. 6.8"
              className="h-9 bg-muted border-0"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Syneresis (%)
            </Label>
            <Input
              type="number"
              step="0.1"
              value={syneresis}
              onChange={(e) => setSyneresis(e.target.value)}
              placeholder="e.g. 3.2"
              className="h-9 bg-muted border-0"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border shrink-0 flex gap-3">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={handleSave}
            disabled={upsertMutation.isPending}
          >
            {upsertMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
