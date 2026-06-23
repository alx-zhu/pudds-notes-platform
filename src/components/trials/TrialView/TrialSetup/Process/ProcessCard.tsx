import { useState } from "react";
import { ListOrdered, Pencil, Plus } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useReadOnly } from "@/contexts/ReadOnlyContext";
import { useTrial } from "@/hooks/useTrials";
import { useExpandable } from "@/components/shared/useExpandable";
import { ExpandMoreFooter } from "@/components/shared/ExpandMoreFooter";
import { ProcessSheet } from "./ProcessSheet";

const MAX_VISIBLE = 3;

interface Props {
  trialId: string;
}

export const ProcessCard = ({ trialId }: Props) => {
  const { data: trial } = useTrial(trialId);
  const isReadOnly = useReadOnly();
  const [sheetOpen, setSheetOpen] = useState(false);

  const steps = trial?.processSteps ?? [];
  const {
    hasMore,
    visibleItems: visibleSteps,
    remaining,
    expanded,
    toggle: toggleExpanded,
  } = useExpandable(steps, MAX_VISIBLE);

  return (
    <>
      <Card className="flex flex-col overflow-hidden gap-0 shrink-0">
        <CardHeader className="py-3 px-5 space-y-0 border-b shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded bg-blue-100 flex items-center justify-center">
                <ListOrdered size={11} className="text-blue-600" />
              </div>
              <span className="text-sm font-semibold text-foreground">
                Process
              </span>
            </div>
            {!isReadOnly && steps.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSheetOpen(true)}
                className="h-7 w-7 p-0"
              >
                <Pencil size={13} />
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {steps.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 px-6 py-8">
              <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                <ListOrdered size={20} className="text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground mb-1">
                  No process steps
                </p>
                <p className="text-xs text-muted-foreground">
                  Add the steps used in this trial
                </p>
              </div>
              {!isReadOnly && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSheetOpen(true)}
                >
                  <Plus size={13} className="mr-1" />
                  Add Steps
                </Button>
              )}
            </div>
          ) : (
            <div className="px-5 py-3">
              {visibleSteps.map((step, stepIdx) => {
                const isLast = stepIdx === visibleSteps.length - 1;
                const filteredParams = step.params.filter((p) => p.key.trim());
                return (
                  <div key={step.id} className="flex">
                    {/* Left: badge + connecting line */}
                    <div className="flex flex-col items-center w-6 shrink-0">
                      <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0">
                        {step.order + 1}
                      </span>
                      {!isLast && (
                        <div className="w-[2px] flex-1 bg-border/50 mt-1" />
                      )}
                    </div>

                    {/* Right: name, params, note */}
                    <div
                      className={`flex-1 min-w-0 pl-3 ${!isLast ? "pb-4" : ""}`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-foreground leading-snug">
                          {step.name || (
                            <span className="text-muted-foreground italic">
                              Unnamed step
                            </span>
                          )}
                        </p>
                        {step.timestamp && (
                          <span className="text-xs text-muted-foreground tabular-nums shrink-0 ml-2">
                            {step.timestamp}
                          </span>
                        )}
                      </div>

                      {filteredParams.length > 0 && (
                        <table className="w-full border-collapse mt-1">
                          <tbody>
                            {filteredParams.map((p, pIdx) => (
                              <tr key={pIdx}>
                                <td className="text-[11px] text-muted-foreground/60 w-[45%] py-0.5">
                                  {p.key}
                                </td>
                                <td className="text-xs font-semibold text-foreground text-right tabular-nums py-0.5">
                                  {p.value}
                                  {p.unit && (
                                    <span className="text-[11px] font-normal text-muted-foreground ml-0.5">
                                      {p.unit}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}

                      {step.notes && (
                        <div className="flex items-start gap-1.5 mt-2 text-[10px] text-amber-900 bg-amber-50 border-l-2 border-amber-400 rounded-r px-2 py-1">
                          <span>⚠</span>
                          <span>{step.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>

        {hasMore && (
          <ExpandMoreFooter
            expanded={expanded}
            remaining={remaining}
            onToggle={toggleExpanded}
          />
        )}
      </Card>

      <ProcessSheet
        trialId={trialId}
        steps={steps}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </>
  );
};
