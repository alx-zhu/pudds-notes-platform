import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Pencil } from "lucide-react";
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

  const statusBadge = setup ? (
    <Badge className="bg-green-100 text-green-800 text-[10px]">
      Complete ✓
    </Badge>
  ) : (
    <Badge variant="secondary" className="text-[10px]">
      Not started
    </Badge>
  );

  return (
    <>
      <Card className="flex flex-col flex-1 min-h-0 overflow-hidden gap-0">
        {/* Header */}
        <CardHeader className="py-2.5 px-4 flex-row items-center justify-between space-y-0 border-b shrink-0">
          <p className="text-sm font-semibold">Trial Setup</p>
          <div className="flex items-center gap-2">
            {setup && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={() => setModalOpen(true)}
              >
                <Pencil size={13} />
              </Button>
            )}
            {statusBadge}
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="p-0 flex-1 overflow-y-auto flex flex-col min-h-0">
          {setup ? (
            <>
              {/* Property rows */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                <span className="text-xs text-muted-foreground">Date</span>
                <span className="text-xs font-medium">
                  {format(parseISO(setup.date), "MMMM d, yyyy")}
                </span>
              </div>

              <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                <span className="text-xs text-muted-foreground">Process</span>
                {(() => {
                  const p = PROCESSING_TYPES.find(
                    (p) => p.value === setup.processingType,
                  );
                  return p ? (
                    <Badge className={`${p.color} text-[11px] font-medium`}>
                      {p.label}
                    </Badge>
                  ) : null;
                })()}
              </div>

              <div className="flex items-center justify-between px-4 py-2">
                <span className="text-xs text-muted-foreground">Flavor</span>
                {(() => {
                  const f = FLAVORS.find((f) => f.value === setup.flavor);
                  return f ? (
                    <Badge className={`${f.color} text-[11px] font-medium`}>
                      {f.label}
                    </Badge>
                  ) : null;
                })()}
              </div>

              {/* Ingredients */}
              <div className="border-t border-border">
                <div className="flex items-center justify-between px-4 pt-3 pb-1.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Ingredients
                  </p>
                  {setup.variables.length > 0 && (
                    <span className="text-[10px] text-muted-foreground">
                      {setup.variables.length}
                    </span>
                  )}
                </div>

                {setup.variables.length === 0 ? (
                  <p className="px-4 py-1.5 pb-3 text-xs text-muted-foreground/70">
                    No ingredients added.
                  </p>
                ) : (
                  <div className="pb-3">
                    {setup.variables.map((v) => (
                      <div
                        key={v.id}
                        className="flex items-center justify-between px-4 py-1.5"
                      >
                        <span className="text-sm">{v.ingredient}</span>
                        <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                          {v.percentage}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6">
              <p className="text-sm text-muted-foreground text-center">
                No setup recorded yet.
              </p>
              <Button size="sm" onClick={() => setModalOpen(true)}>
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
