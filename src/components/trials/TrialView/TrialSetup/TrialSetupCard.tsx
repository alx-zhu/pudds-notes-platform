import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Pencil, FlaskConical, Plus } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrialSetupModal } from "@/components/trials/TrialView/TrialSetup/TrialSetupModal";
import { useTrial } from "@/hooks/useTrials";
import { FLAVORS, PROCESSING_TYPES } from "@/config/trial.config";
import type { Trial } from "@/types/trial";

interface Props {
  trialId: string;
}

const getDefaultTrialName = (trial: Trial): string => {
  const setup = trial.setup;
  if (!setup) return `Trial #${trial.trialNumber}`;

  const flavor = FLAVORS.find((f) => f.value === setup.flavor);
  const processing = PROCESSING_TYPES.find(
    (p) => p.value === setup.processingType,
  );
  const date = format(parseISO(setup.date), "MMM d, yyyy");

  const parts = [flavor?.label, processing?.label].filter(Boolean);

  return parts.length > 0
    ? `${parts.join(" ")} — ${date}`
    : `Trial #${trial.trialNumber}`;
};

export const TrialSetupCard = ({ trialId }: Props) => {
  const { data: trial } = useTrial(trialId);
  const [modalOpen, setModalOpen] = useState(false);

  const setup = trial?.setup;
  const defaultName = trial ? getDefaultTrialName(trial) : "";
  const displayName = trial?.name || defaultName;

  return (
    <>
      <Card className="flex flex-col overflow-hidden gap-0 shrink-0">
        {/* Header */}
        <CardHeader className="py-3 px-5 space-y-0 border-b shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded bg-blue-100 flex items-center justify-center">
                <FlaskConical size={11} className="text-blue-600" />
              </div>
              <span className="text-sm font-semibold text-foreground">
                Trial Setup
              </span>
            </div>
            {setup ? (
              <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Complete
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">Not started</span>
            )}
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="p-0">
          {setup ? (
            <div className="divide-y divide-border/40">
              <div className="flex items-center justify-between px-5 py-3 bg-muted/30">
                <span className="text-sm text-muted-foreground">Name</span>
                <span className="text-sm font-medium text-foreground text-right truncate max-w-[60%]">
                  {displayName}
                </span>
              </div>

              <div className="flex items-center justify-between px-5 py-3">
                <span className="text-sm text-muted-foreground">Date</span>
                <span className="text-sm font-medium text-foreground">
                  {format(parseISO(setup.date), "MMM d, yyyy")}
                </span>
              </div>

              <div className="flex items-center justify-between px-5 py-3 bg-muted/30">
                <span className="text-sm text-muted-foreground">
                  Processing
                </span>
                {(() => {
                  const p = PROCESSING_TYPES.find(
                    (p) => p.value === setup.processingType,
                  );
                  return p ? (
                    <Badge className={`${p.color} text-xs font-medium`}>
                      {p.label}
                    </Badge>
                  ) : null;
                })()}
              </div>

              <div className="flex items-center justify-between px-5 py-3">
                <span className="text-sm text-muted-foreground">Flavor</span>
                {(() => {
                  const f = FLAVORS.find((f) => f.value === setup.flavor);
                  return f ? (
                    <Badge className={`${f.color} text-xs font-medium`}>
                      {f.label}
                    </Badge>
                  ) : null;
                })()}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 px-6 py-8">
              <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                <FlaskConical size={20} className="text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground mb-1">
                  No setup yet
                </p>
                <p className="text-xs text-muted-foreground">
                  Configure this trial's parameters
                </p>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-center shrink-0">
          <Button
            size="sm"
            variant={setup ? "outline" : "default"}
            onClick={() => setModalOpen(true)}
            className="gap-2"
          >
            {setup ? <Pencil size={14} /> : <Plus size={14} />}
            {setup ? "Edit Setup" : "Add Setup"}
          </Button>
        </CardFooter>
      </Card>

      <TrialSetupModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        trialId={trialId}
        initialSetup={setup}
        initialName={trial?.name}
        key={modalOpen ? "open" : "closed"}
      />
    </>
  );
};
