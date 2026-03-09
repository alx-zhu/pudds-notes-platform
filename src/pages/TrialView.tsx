import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Bell } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
      {/* Topbar */}
      <header className="h-14 bg-card border-b border-border flex items-center px-4 gap-3 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-8 w-8 bg-muted"
          onClick={() => navigate("/trials")}
        >
          <ChevronLeft size={16} />
        </Button>
        <div>
          <p className="text-base font-extrabold tracking-tight">
            Trial #{trial.trialNumber}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge
            className={cn(
              "text-[11px] font-semibold",
              completion.isFullyComplete
                ? "bg-green-100 text-green-800"
                : "bg-amber-100 text-amber-800",
            )}
          >
            ●{" "}
            {completion.isFullyComplete
              ? "All sections complete"
              : `${completion.completedSections} of 3 sections complete`}
          </Badge>
          <Button variant="outline" size="sm" className="h-8">
            Compare
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
            <Bell size={15} />
          </Button>
        </div>
      </header>

      {/* 3-section layout */}
      <div
        className="flex-1 overflow-hidden p-4 grid gap-3 min-h-0"
        style={{
          gridTemplateColumns: "500px 1fr",
          gridTemplateRows: "1fr",
        }}
      >
        {/* Left column: Setup + Sensory */}
        <div className="flex flex-col gap-3 min-h-0 overflow-hidden">
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <TrialSetupCard trialId={trial.id} />
          </div>
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
