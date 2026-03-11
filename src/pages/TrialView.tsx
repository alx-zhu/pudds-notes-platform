import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, FlaskConical } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import TrialSetupCard from "@/components/trials/TrialView/TrialSetup/TrialSetupCard";
import SensoryEvalCard from "@/components/trials/TrialView/SensoryEval/SensoryEvalCard";
import PhotoGridCard from "@/components/trials/TrialView/PhotoGrid/PhotoGridCard";
import { useTrial } from "@/hooks/useTrials";
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

  const subtitle = [
    setup?.date ? format(parseISO(setup.date), "MMM d, yyyy") : null,
    setup?.flavor
      ? setup.flavor.charAt(0).toUpperCase() + setup.flavor.slice(1)
      : null,
    setup?.processingType
      ? setup.processingType.charAt(0).toUpperCase() +
        setup.processingType.slice(1)
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

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
              <h1 className="text-base font-semibold leading-tight">
                Trial #{trial.trialNumber}
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

      {/* Content area */}
      <div
        className="flex-1 overflow-hidden p-6 grid gap-5 min-h-0"
        style={{
          gridTemplateColumns: "minmax(380px, 460px) 1fr",
          gridTemplateRows: "1fr",
        }}
      >
        {/* Left column: Setup + Sensory */}
        <div className="flex flex-col gap-5 min-h-0 overflow-hidden">
          <TrialSetupCard trialId={trial.id} />
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <SensoryEvalCard trialId={trial.id} />
          </div>
        </div>

        {/* Right column: Photos */}
        <div className="min-h-0 flex flex-col overflow-hidden">
          <PhotoGridCard trialId={trial.id} />
        </div>
      </div>
    </>
  );
}
