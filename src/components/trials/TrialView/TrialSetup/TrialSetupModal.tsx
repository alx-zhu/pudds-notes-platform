import { useState } from "react";
import { format, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  IngredientRow,
  AddIngredientRow,
} from "@/components/trials/TrialView/TrialSetup/IngredientRow";
import {
  useCreateTrialWithSetup,
  useUpdateTrialSetup,
} from "@/hooks/useTrials";
import { PROCESSING_TYPES, FLAVORS } from "@/config/trial.config";
import { cn } from "@/lib/utils";
import type { TrialSetup, Variable } from "@/types/trial";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** If provided, editing an existing trial. If absent, creating a new one. */
  trialId?: string;
  initialSetup?: TrialSetup;
  onSuccess?: (trialId: string) => void;
}

const DEFAULT_SETUP: TrialSetup = {
  date: new Date().toISOString(),
  processingType: "shelftop",
  flavor: "chocolate",
  variables: [],
  emphasis: "",
};

export default function TrialSetupModal({
  open,
  onOpenChange,
  trialId,
  initialSetup,
  onSuccess,
}: Props) {
  const [draft, setDraft] = useState<TrialSetup>(initialSetup ?? DEFAULT_SETUP);

  const createMutation = useCreateTrialWithSetup();
  const updateMutation = useUpdateTrialSetup(trialId ?? "");
  const isPending = createMutation.isPending || updateMutation.isPending;

  function updateVariable(id: string, ingredient: string, percentage: number) {
    setDraft((d) => ({
      ...d,
      variables: d.variables.map((v) =>
        v.id === id ? { ...v, ingredient, percentage } : v,
      ),
    }));
  }

  function removeVariable(id: string) {
    setDraft((d) => ({
      ...d,
      variables: d.variables.filter((v) => v.id !== id),
    }));
  }

  function addVariable(ingredient: string, percentage: number) {
    if (!ingredient.trim()) return;
    const newVar: Variable = {
      id: crypto.randomUUID(),
      ingredient,
      percentage,
    };
    setDraft((d) => ({ ...d, variables: [...d.variables, newVar] }));
  }

  function handleSave() {
    if (trialId) {
      updateMutation.mutate(draft, {
        onSuccess: () => {
          onOpenChange(false);
          onSuccess?.(trialId);
        },
      });
    } else {
      createMutation.mutate(draft, {
        onSuccess: (trial) => {
          onOpenChange(false);
          onSuccess?.(trial.id);
        },
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-5 border-b border-border shrink-0">
          <DialogTitle>
            {trialId ? "Edit Trial Setup" : "New Trial"}
          </DialogTitle>
          <DialogDescription>
            {trialId
              ? "Update the parameters for this trial."
              : "Set up the parameters to create a new trial."}
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6 min-h-0">
          {/* Date */}
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="justify-start text-left font-normal h-9 bg-muted border-0"
                >
                  <CalendarIcon
                    size={14}
                    className="mr-2 text-muted-foreground"
                  />
                  {draft.date
                    ? format(parseISO(draft.date), "MMMM d, yyyy")
                    : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={draft.date ? parseISO(draft.date) : undefined}
                  onSelect={(d) =>
                    d &&
                    setDraft((prev) => ({ ...prev, date: d.toISOString() }))
                  }
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Flavor */}
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Flavor
            </Label>
            <ToggleGroup
              type="single"
              value={draft.flavor}
              onValueChange={(v) =>
                v && setDraft((d) => ({ ...d, flavor: v as typeof d.flavor }))
              }
              className="w-full bg-muted rounded-lg p-1"
            >
              {FLAVORS.map((f) => (
                <ToggleGroupItem
                  key={f.value}
                  value={f.value}
                  className={cn(
                    "flex-1 text-sm font-medium py-1.5",
                    f.activeClass,
                  )}
                >
                  {f.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          {/* Processing Type */}
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Processing Type
            </Label>
            <ToggleGroup
              type="single"
              value={draft.processingType}
              onValueChange={(v) =>
                v &&
                setDraft((d) => ({
                  ...d,
                  processingType: v as typeof d.processingType,
                }))
              }
              className="w-full bg-muted rounded-lg p-1"
            >
              {PROCESSING_TYPES.map((p) => (
                <ToggleGroupItem
                  key={p.value}
                  value={p.value}
                  className={cn(
                    "flex-1 text-sm font-medium py-1.5",
                    p.activeClass,
                  )}
                >
                  {p.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          {/* Variables */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Ingredients
              </Label>
              {draft.variables.length > 0 && (
                <span className="text-xs text-muted-foreground tabular-nums">
                  {draft.variables.length} added
                </span>
              )}
            </div>

            <div className="rounded-xl bg-muted/30 ring-1 ring-border/40 p-3">
              {/* Column headers */}
              <div className="grid grid-cols-[1fr_5rem_2.5rem] gap-3 px-1 pb-2 mb-2 border-b border-border/30">
                <span className="text-xs font-medium text-muted-foreground">
                  Name
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                  %
                </span>
                <span />
              </div>

              <div className="flex flex-col gap-2">
                {draft.variables.length === 0 ? (
                  <p className="text-sm text-muted-foreground/50 py-2 px-1">
                    No ingredients yet
                  </p>
                ) : (
                  draft.variables.map((v) => (
                    <IngredientRow
                      key={v.id}
                      ingredient={v.ingredient}
                      percentage={v.percentage}
                      onChange={(ing, pct) => updateVariable(v.id, ing, pct)}
                      onRemove={() => removeVariable(v.id)}
                    />
                  ))
                )}
                <AddIngredientRow onAdd={(ing, pct) => addVariable(ing, pct)} />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
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
            disabled={isPending}
          >
            {isPending
              ? "Saving..."
              : trialId
                ? "Save Changes"
                : "Create Trial"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
