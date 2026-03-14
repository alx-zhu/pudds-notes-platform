import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, FlaskConical } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import TrialSetupCard from "@/components/trials/TrialView/TrialSetup/TrialSetupCard";
import CategoryDetailCard from "@/components/trials/TrialView/CategoryDetail/CategoryDetailCard";
import { useTrial } from "@/hooks/useTrials";
import { FLAVORS, PROCESSING_TYPES } from "@/config/trial.config";
import { computeCompletion } from "@/lib/completion";
import { cn } from "@/lib/utils";

export default function TrialView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: trial, isLoading, isError } = useTrial(id ?? "");

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading trial...</p>
      </div>
    );
  }

  if (isError || !trial) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Trial not found.</p>
      </div>
    );
  }

  const completion = computeCompletion(trial);
  const setup = trial.setup;

  // Build display name: custom name → generated from params → fallback
  const generatedName = setup
    ? [
        FLAVORS.find((f) => f.value === setup.flavor)?.label,
        PROCESSING_TYPES.find((p) => p.value === setup.processingType)?.label,
      ]
        .filter(Boolean)
        .join(" ") +
      ` — ${format(parseISO(setup.date), "MMM d, yyyy")}`
    : null;

  const pageTitle = trial.name || generatedName || `Trial #${trial.trialNumber}`;

  // Subtitle: always show trial number; include generated name when title is custom
  const subtitleParts = [`Trial #${trial.trialNumber}`];
  if (trial.name && generatedName) {
    subtitleParts.push(generatedName);
  }
  const subtitle = subtitleParts.length > 0 ? subtitleParts.join(" · ") : "";

  return (
    <>
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4 shrink-0">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-lg h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => navigate("/trials")}
          >
            <ChevronLeft size={18} />
          </Button>

          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <FlaskConical size={16} className="text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-semibold leading-tight truncate">
                {pageTitle}
              </h1>
              {subtitle && (
                <p className="text-sm text-muted-foreground truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div
                className={cn(
                  "flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium",
                  completion.isFullyComplete
                    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                    : "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    completion.isFullyComplete
                      ? "bg-emerald-500"
                      : "bg-amber-500",
                  )}
                />
                {completion.isFullyComplete
                  ? "All complete"
                  : `${completion.completedSections} of 3 complete`}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content area — scrollable */}
      <div className="flex-1 overflow-y-auto p-6 min-h-0">
        <div
          className="grid gap-5 items-start"
          style={{
            gridTemplateColumns: "minmax(320px, 380px) 1fr",
          }}
        >
          {/* Left column: Setup only, sticky */}
          <div className="sticky top-0">
            <TrialSetupCard trialId={trial.id} />
          </div>

          {/* Right column: unified category view */}
          <div className="flex flex-col gap-5">
            <CategoryDetailCard trialId={trial.id} />
          </div>
        </div>
      </div>
    </>
  );
}
