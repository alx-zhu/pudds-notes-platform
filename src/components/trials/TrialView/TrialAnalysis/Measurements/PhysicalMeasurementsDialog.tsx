import { useState } from "react";
import { Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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

export const PhysicalMeasurementsDialog = ({
  open,
  onOpenChange,
  trialId,
  logId,
  logLabel,
  initialMeasurements,
}: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm flex flex-col p-0 gap-0 overflow-hidden">
        {open && (
          <MeasurementsForm
            trialId={trialId}
            logId={logId}
            logLabel={logLabel}
            initialMeasurements={initialMeasurements}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

const MeasurementsForm = ({
  trialId,
  logId,
  logLabel,
  initialMeasurements,
  onClose,
}: {
  trialId: string;
  logId: string;
  logLabel: string;
  initialMeasurements?: PhysicalMeasurements;
  onClose: () => void;
}) => {
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
      { onSuccess: onClose },
    );
  };

  return (
    <>
      <DialogHeader className="px-6 pt-6 pb-5 border-b border-border shrink-0">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
            <Ruler size={16} className="text-emerald-600" />
          </div>
          <DialogTitle>Physical Measurements</DialogTitle>
        </div>
        <DialogDescription>{logLabel}</DialogDescription>
      </DialogHeader>

      <div className="px-6 py-6 flex flex-col gap-5">
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
          onClick={onClose}
          disabled={upsertMutation.isPending}
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
    </>
  );
};
