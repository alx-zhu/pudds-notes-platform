import { useState, useEffect } from "react";
import { X, ChevronUp, ChevronDown, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { StringCombobox } from "@/components/shared/StringCombobox";
import { useReadOnly } from "@/contexts/ReadOnlyContext";
import { useUpsertProcessSteps, useProcessRecordSuggestions } from "@/hooks/useTrials";
import type { ProcessStep, ProcessParam } from "@/types/trial";

interface Props {
  trialId: string;
  steps: ProcessStep[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProcessSheet = ({ trialId, steps, open, onOpenChange }: Props) => {
  const isReadOnly = useReadOnly();
  const [draft, setDraft] = useState<ProcessStep[]>(steps);
  const upsert = useUpsertProcessSteps(trialId);
  const suggestions = useProcessRecordSuggestions();

  useEffect(() => {
    if (open) setDraft(steps);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const reindex = (arr: ProcessStep[]): ProcessStep[] =>
    arr.map((s, i) => ({ ...s, order: i }));

  const addStep = () => {
    setDraft((prev) =>
      reindex([
        ...prev,
        {
          id: crypto.randomUUID(),
          order: prev.length,
          name: "",
          params: [{ key: "Duration", value: "", unit: "min" }],
        },
      ]),
    );
  };

  const removeStep = (idx: number) => {
    setDraft((prev) => reindex(prev.filter((_, i) => i !== idx)));
  };

  const moveStep = (idx: number, dir: -1 | 1) => {
    setDraft((prev) => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return reindex(next);
    });
  };

  const updateStep = (idx: number, patch: Partial<ProcessStep>) => {
    setDraft((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)),
    );
  };

  const addParam = (stepIdx: number) => {
    setDraft((prev) =>
      prev.map((s, i) =>
        i === stepIdx
          ? { ...s, params: [...s.params, { key: "", value: "", unit: "" }] }
          : s,
      ),
    );
  };

  const updateParam = (
    stepIdx: number,
    paramIdx: number,
    patch: Partial<ProcessParam>,
  ) => {
    setDraft((prev) =>
      prev.map((s, i) =>
        i === stepIdx
          ? {
              ...s,
              params: s.params.map((p, j) =>
                j === paramIdx ? { ...p, ...patch } : p,
              ),
            }
          : s,
      ),
    );
  };

  const removeParam = (stepIdx: number, paramIdx: number) => {
    setDraft((prev) =>
      prev.map((s, i) =>
        i === stepIdx
          ? { ...s, params: s.params.filter((_, j) => j !== paramIdx) }
          : s,
      ),
    );
  };

  const handleSave = () => {
    upsert.mutate(draft, { onSuccess: () => onOpenChange(false) });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="data-[side=right]:sm:max-w-2xl w-full p-0 flex flex-col gap-0"
      >
        <SheetTitle className="sr-only">Process</SheetTitle>
        <SheetDescription className="sr-only">Edit process steps</SheetDescription>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b bg-card shrink-0">
          <div className="text-sm font-semibold text-foreground">
            Process
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer w-7 h-7 rounded-md border flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X size={13} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto bg-muted/30 p-5 flex flex-col gap-3">
          {draft.map((step, stepIdx) => (
            <Card key={step.id} className="bg-white shadow-sm shrink-0">
              <CardContent className="p-4 flex flex-col gap-4">
                {/* Header row */}
                <div className="flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-[11px] font-bold text-primary-foreground shrink-0">
                    {stepIdx + 1}
                  </span>
                  {isReadOnly ? (
                    <Input
                      value={step.name}
                      readOnly
                      className="flex-1 h-8 text-sm"
                    />
                  ) : (
                    <StringCombobox
                      value={step.name}
                      onChange={(v) => updateStep(stepIdx, { name: v })}
                      suggestions={suggestions.stepNames}
                      placeholder="Step name"
                      searchPlaceholder="Search or create step..."
                      className="flex-1 h-8 text-sm"
                    />
                  )}
                  {!isReadOnly && (
                    <>
                      <button
                        type="button"
                        onClick={() => moveStep(stepIdx, -1)}
                        disabled={stepIdx === 0}
                        className="cursor-pointer h-7 w-7 flex items-center justify-center rounded border text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveStep(stepIdx, 1)}
                        disabled={stepIdx === draft.length - 1}
                        className="cursor-pointer h-7 w-7 flex items-center justify-center rounded border text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronDown size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeStep(stepIdx)}
                        className="cursor-pointer h-7 w-7 flex items-center justify-center rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>

                {/* Time */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-muted-foreground w-20 shrink-0">
                    Time
                  </span>
                  <Input
                    type="time"
                    value={step.timestamp ?? ""}
                    onChange={(e) =>
                      updateStep(stepIdx, {
                        timestamp: e.target.value || undefined,
                      })
                    }
                    className="h-8 text-sm w-36"
                    readOnly={isReadOnly}
                  />
                </div>

                {/* Parameters */}
                <div className="flex flex-col gap-1.5">
                  <div className="grid grid-cols-[1fr_1fr_100px_20px] gap-1.5">
                    <span className="text-[11px] font-medium text-muted-foreground px-1">
                      Name
                    </span>
                    <span className="text-[11px] font-medium text-muted-foreground px-1">
                      Value
                    </span>
                    <span className="text-[11px] font-medium text-muted-foreground px-1">
                      Unit
                    </span>
                    <span />
                  </div>
                  {step.params.map((param, paramIdx) => (
                    <div
                      key={paramIdx}
                      className="grid grid-cols-[1fr_1fr_100px_20px] gap-1.5 items-center"
                    >
                      {isReadOnly ? (
                        <>
                          <Input value={param.key} readOnly className="h-7 text-xs" />
                          <Input value={param.value} readOnly className="h-7 text-xs" />
                          <Input value={param.unit ?? ""} readOnly className="h-7 text-xs" />
                        </>
                      ) : (
                        <>
                          <StringCombobox
                            value={param.key}
                            onChange={(v) => updateParam(stepIdx, paramIdx, { key: v })}
                            suggestions={suggestions.paramKeys}
                            placeholder="Name"
                            searchPlaceholder="Search or create..."
                            className="h-7 text-xs"
                          />
                          <StringCombobox
                            value={param.value}
                            onChange={(v) => updateParam(stepIdx, paramIdx, { value: v })}
                            suggestions={suggestions.getParamValues(param.key)}
                            placeholder="Value"
                            searchPlaceholder="Search or create..."
                            className="h-7 text-xs"
                          />
                          <StringCombobox
                            value={param.unit ?? ""}
                            onChange={(v) =>
                              updateParam(stepIdx, paramIdx, { unit: v || undefined })
                            }
                            suggestions={suggestions.getParamUnits(param.key)}
                            placeholder="Unit"
                            searchPlaceholder="Search or create..."
                            className="h-7 text-xs"
                          />
                        </>
                      )}
                      {!isReadOnly && (
                        <button
                          type="button"
                          onClick={() => removeParam(stepIdx, paramIdx)}
                          className="cursor-pointer h-5 w-5 flex items-center justify-center rounded text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X size={11} />
                        </button>
                      )}
                    </div>
                  ))}
                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={() => addParam(stepIdx)}
                      className="cursor-pointer text-xs text-primary hover:underline text-left mt-0.5 w-fit"
                    >
                      Add parameter
                    </button>
                  )}
                </div>

                {/* Notes */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground">
                    Notes
                  </span>
                  <Textarea
                    value={step.notes ?? ""}
                    onChange={(e) =>
                      updateStep(stepIdx, { notes: e.target.value || undefined })
                    }
                    placeholder="Optional notes..."
                    className="text-sm resize-none h-16"
                    readOnly={isReadOnly}
                  />
                </div>
              </CardContent>
            </Card>
          ))}

          {!isReadOnly && (
            <button
              type="button"
              onClick={addStep}
              className="cursor-pointer w-full border-2 border-dashed border-border rounded-lg py-3 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
            >
              <Plus size={14} />
              Add step
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t bg-card shrink-0">
          <span className="text-xs text-muted-foreground">
            {draft.length} {draft.length === 1 ? "step" : "steps"}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            {!isReadOnly && (
              <Button size="sm" disabled={upsert.isPending} onClick={handleSave}>
                {upsert.isPending ? "Saving..." : "Save Changes"}
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
