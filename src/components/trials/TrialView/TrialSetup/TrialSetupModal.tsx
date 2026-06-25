import { useState } from "react";
import { format, parseISO } from "date-fns";
import { CalendarIcon, Lock, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { StringCombobox } from "@/components/shared/StringCombobox";
import {
  useCreateTrialWithSetup,
  useUpdateTrialSetup,
  useUpdateTrialName,
  useAllThermalProcessingTypeSuggestions,
} from "@/hooks/useTrials";
import { PROCESSING_TYPES, FLAVORS } from "@/config/trial.config";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import type { TrialSetup, TrialVisibility } from "@/types/trial";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** If provided, editing an existing trial. If absent, creating a new one. */
  trialId?: string;
  initialSetup?: TrialSetup;
  initialName?: string;
  initialVisibility?: TrialVisibility;
  onSuccess?: (trialId: string) => void;
}

const DEFAULT_SETUP: TrialSetup = {
  date: new Date().toISOString(),
  processingType: "shelftop",
  flavor: "chocolate",
  thermalProcessingType: "",
};

export const TrialSetupModal = ({
  open,
  onOpenChange,
  trialId,
  initialSetup,
  initialName,
  initialVisibility,
  onSuccess,
}: Props) => {
  const { role } = useAuth();
  const isOwner = role === "owner";

  const [draft, setDraft] = useState<TrialSetup>(initialSetup ?? DEFAULT_SETUP);
  const [nameDraft, setNameDraft] = useState<string>(initialName ?? "");
  // Seed visibility: editing → existing value; creating → owners default to
  // private, everyone else creates public (they can't see private trials).
  const [visibility, setVisibility] = useState<TrialVisibility>(
    initialVisibility ?? (isOwner ? "private" : "public"),
  );

  const createMutation = useCreateTrialWithSetup();
  const updateMutation = useUpdateTrialSetup(trialId ?? "");
  const updateNameMutation = useUpdateTrialName(trialId ?? "");
  const thermalSuggestions = useAllThermalProcessingTypeSuggestions();
  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    updateNameMutation.isPending;

  const canSave = draft.thermalProcessingType.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    if (trialId) {
      updateMutation.mutate(
        { setup: draft, visibility: isOwner ? visibility : undefined },
        {
          onSuccess: () => {
            updateNameMutation.mutate(nameDraft.trim() || undefined, {
              onSuccess: () => {
                onOpenChange(false);
                onSuccess?.(trialId);
              },
            });
          },
        },
      );
    } else {
      createMutation.mutate(
        {
          setup: draft,
          name: nameDraft.trim() || undefined,
          visibility,
        },
        {
          onSuccess: (trial) => {
            onOpenChange(false);
            onSuccess?.(trial.id);
          },
        },
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md flex flex-col p-0 gap-0 overflow-hidden">
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

        {/* Body */}
        <div className="px-6 py-6 flex flex-col gap-6">
          {/* Trial Name */}
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Trial Name (Optional)
            </Label>
            <Input
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              placeholder="e.g. Chocolate Benchtop Batch 2"
              className="h-9 bg-muted border-0"
            />
          </div>

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

          {/* Thermal Processing */}
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Thermal Processing <span className="text-destructive">*</span>
            </Label>
            <StringCombobox
              value={draft.thermalProcessingType}
              onChange={(v) => setDraft((d) => ({ ...d, thermalProcessingType: v }))}
              suggestions={thermalSuggestions}
              placeholder="Select or type..."
              searchPlaceholder="Search or create new..."
              emptyMessage="No matching types."
            />
          </div>

          {/* Visibility — owners only */}
          {isOwner && (
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Visibility
              </Label>
              <ToggleGroup
                type="single"
                value={visibility}
                onValueChange={(v) => v && setVisibility(v as TrialVisibility)}
                className="w-full bg-muted rounded-lg p-1"
              >
                <ToggleGroupItem
                  value="private"
                  className="flex-1 gap-1.5 text-sm font-medium py-1.5 data-[state=on]:bg-background"
                >
                  <Lock size={13} />
                  Private
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="public"
                  className="flex-1 gap-1.5 text-sm font-medium py-1.5 data-[state=on]:bg-background"
                >
                  <Globe size={13} />
                  Public
                </ToggleGroupItem>
              </ToggleGroup>
              <p className="text-xs text-muted-foreground">
                Private trials are visible only to owners.
              </p>
            </div>
          )}
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
            disabled={isPending || !canSave}
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
};
