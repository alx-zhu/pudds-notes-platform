import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Pencil, Settings2, Plus } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import TrialSetupModal from "@/components/trials/TrialView/TrialSetup/TrialSetupModal";
import { useTrial } from "@/hooks/useTrials";
import { FLAVORS, PROCESSING_TYPES } from "@/config/trial.config";

interface Props {
  trialId: string;
}

export default function TrialSetupCard({ trialId }: Props) {
  const { data: trial } = useTrial(trialId);
  const [modalOpen, setModalOpen] = useState(false);

  const setup = trial?.setup;

  return (
    <>
      <Card className="group/card flex flex-col overflow-hidden gap-0 shrink-0">
        {/* Header */}
        <CardHeader className="py-3 px-5 flex-row items-center justify-between space-y-0 border-b shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-6 rounded-md bg-blue-100 flex items-center justify-center">
              <Settings2 size={13} className="text-blue-600" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              Trial Setup
            </p>
          </div>
          <div className="flex items-center gap-2">
            {setup && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground opacity-0 group-hover/card:opacity-100 transition-opacity"
                onClick={() => setModalOpen(true)}
              >
                <Pencil size={13} />
              </Button>
            )}
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

              {/* Ingredients section */}
              {setup.variables.length > 0 && (
                <div className="px-5 py-3 border-t border-border/40">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Ingredients
                    </span>
                    <Badge
                      variant="secondary"
                      className="text-xs font-medium tabular-nums"
                    >
                      {setup.variables.length}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    {setup.variables.map((v) => (
                      <div
                        key={v.id}
                        className="flex items-center justify-between py-1.5 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <span className="text-sm text-foreground">
                          {v.ingredient}
                        </span>
                        <span className="text-sm font-medium tabular-nums text-muted-foreground">
                          {v.percentage}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {setup.variables.length === 0 && (
                <div className="px-5 py-3 border-t border-border/40">
                  <p className="text-sm text-muted-foreground/60">
                    No ingredients added
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 px-6 py-8">
              <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                <Settings2 size={20} className="text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground mb-1">
                  No setup yet
                </p>
                <p className="text-xs text-muted-foreground">
                  Configure this trial's parameters
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => setModalOpen(true)}
                className="gap-1.5"
              >
                <Plus size={14} />
                Add Setup
              </Button>
            </div>
          )}
        </CardContent>
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
}
