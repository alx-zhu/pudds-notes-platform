import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
      <Card className="flex flex-col flex-1 min-h-0 overflow-hidden gap-0">
        <CardHeader className="py-3 px-4 flex-row items-center justify-between space-y-0 border-b shrink-0">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
              Trial Setup
            </p>
          </div>
          {setup ? (
            <Badge className="bg-green-100 text-green-800 text-[10px]">
              Complete ✓
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-[10px]">
              Not started
            </Badge>
          )}
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-0">
          {setup ? (
            <>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Date
                </p>
                <p className="text-sm font-semibold">
                  {format(parseISO(setup.date), "MMMM d, yyyy")}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Type & Flavor
                </p>
                <div className="flex gap-2 flex-wrap">
                  {(() => {
                    const p = PROCESSING_TYPES.find(
                      (p) => p.value === setup.processingType,
                    );
                    return p ? (
                      <Badge className={p.color}>{p.label}</Badge>
                    ) : null;
                  })()}
                  {(() => {
                    const f = FLAVORS.find((f) => f.value === setup.flavor);
                    return f ? (
                      <Badge className={f.color}>{f.label}</Badge>
                    ) : null;
                  })()}
                </div>
              </div>
              {setup.variables.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                      Variables
                    </p>
                    <div className="flex flex-col gap-2">
                      {setup.variables.map((v) => (
                        <div key={v.id}>
                          <div className="flex justify-between items-baseline">
                            <span className="text-sm text-muted-foreground">
                              {v.ingredient}
                            </span>
                            <span className="text-sm font-bold">
                              {v.percentage}%
                            </span>
                          </div>
                          <div className="mt-1 h-0.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-foreground rounded-full"
                              style={{
                                width: `${Math.min(v.percentage * 2, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-auto"
                onClick={() => setModalOpen(true)}
              >
                Edit
              </Button>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
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
