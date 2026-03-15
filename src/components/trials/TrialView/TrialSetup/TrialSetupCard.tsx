import { useState, useRef, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { Pencil, FlaskConical, Plus, Check, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { TrialSetupModal } from "@/components/trials/TrialView/TrialSetup/TrialSetupModal";
import { useTrial, useUpdateTrialName } from "@/hooks/useTrials";
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
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);
  const nameMutation = useUpdateTrialName(trialId);

  const setup = trial?.setup;
  const defaultName = trial ? getDefaultTrialName(trial) : "";
  const displayName = trial?.name || defaultName;
  const isCustomName = Boolean(trial?.name);

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  const startEditingName = () => {
    setNameDraft(trial?.name || "");
    setIsEditingName(true);
  };

  const saveName = () => {
    const trimmed = nameDraft.trim();
    nameMutation.mutate(trimmed || undefined);
    setIsEditingName(false);
  };

  const cancelEditingName = () => {
    setIsEditingName(false);
  };

  return (
    <>
      <Card className="flex flex-col overflow-hidden gap-0 shrink-0">
        {/* Header */}
        <CardHeader className="py-3 px-5 space-y-0 border-b shrink-0">
          {/* Top row: label + status */}
          <div className="flex items-center justify-between mb-1.5">
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

          {/* Trial name row */}
          <div className="flex items-center gap-2 min-h-7">
            {isEditingName ? (
              <div className="flex items-center gap-1.5 flex-1">
                <Input
                  ref={nameInputRef}
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveName();
                    if (e.key === "Escape") cancelEditingName();
                  }}
                  placeholder={defaultName}
                  className="h-7 text-sm font-semibold"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                  onClick={saveName}
                >
                  <Check size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
                  onClick={cancelEditingName}
                >
                  <X size={14} />
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={startEditingName}
                className="text-sm font-semibold text-foreground text-left truncate hover:underline decoration-muted-foreground/40 underline-offset-2 cursor-text"
                title="Click to rename"
              >
                <span className={isCustomName ? "" : "text-muted-foreground"}>
                  {displayName}
                </span>
              </button>
            )}
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="p-0">
          {setup ? (
            <div>
              {/* Property table — alternating subtle backgrounds */}
              <div className="divide-y divide-border/40">
                <div className="flex items-center justify-between px-5 py-3 bg-muted/30">
                  <span className="text-sm text-muted-foreground">Date</span>
                  <span className="text-sm font-medium text-foreground">
                    {format(parseISO(setup.date), "MMM d, yyyy")}
                  </span>
                </div>

                <div className="flex items-center justify-between px-5 py-3">
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

                <div className="flex items-center justify-between px-5 py-3 bg-muted/30">
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
        key={modalOpen ? "open" : "closed"}
      />
    </>
  );
};
