import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, FlaskConical, Pencil } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { IngredientsCard } from "@/components/trials/TrialView/TrialSetup/ingredients/IngredientsCard";
import { CostCard } from "@/components/trials/TrialView/CostCard";
import { AnalysisLogCard } from "@/components/trials/TrialView/TrialAnalysis/AnalysisLogCard";
import { CommentsCard } from "@/components/trials/TrialView/TrialAnalysis/Comments/CommentsCard";
import { SensoryForm } from "@/components/trials/TrialView/TrialAnalysis/Sensory/SensoryForm/SensoryForm";
import { TrialSetupModal } from "@/components/trials/TrialView/TrialSetup/TrialSetupModal";
import { useTrial } from "@/hooks/useTrials";
import { useReadOnly } from "@/contexts/ReadOnlyContext";
import { FLAVORS, PROCESSING_TYPES } from "@/config/trial.config";
import type { SensoryEvaluation, SensoryFormState } from "@/types/trial";

export const TrialView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isReadOnly = useReadOnly();
  const { data: trial, isLoading, isError } = useTrial(id ?? "");
  const [sensoryFormState, setSensoryFormState] =
    useState<SensoryFormState | null>(null);
  const [setupModalOpen, setSetupModalOpen] = useState(false);

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

  const setup = trial.setup;

  // Build display name: custom name → generated from params → fallback
  const generatedName = setup
    ? [
        FLAVORS.find((f) => f.value === setup.flavor)?.label,
        PROCESSING_TYPES.find((p) => p.value === setup.processingType)?.label,
      ]
        .filter(Boolean)
        .join(" ") + ` — ${format(parseISO(setup.date), "MMM d, yyyy")}`
    : null;

  const pageTitle =
    trial.name || generatedName || `Trial #${trial.trialNumber}`;

  // Subtitle: trial number + setup details when available
  const subtitleParts = [`Trial #${trial.trialNumber}`];
  if (setup) {
    const flavorLabel = FLAVORS.find((f) => f.value === setup.flavor)?.label;
    const processingLabel = PROCESSING_TYPES.find(
      (p) => p.value === setup.processingType,
    )?.label;
    if (flavorLabel) subtitleParts.push(flavorLabel);
    if (processingLabel) subtitleParts.push(processingLabel);
    subtitleParts.push(format(parseISO(setup.date), "MMM d, yyyy"));
  }
  const subtitle = subtitleParts.join(" · ");

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

          {!isReadOnly && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 shrink-0"
              onClick={() => setSetupModalOpen(true)}
            >
              <Pencil size={14} />
              Edit Setup
            </Button>
          )}
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
          {/* Left column: Ingredients + Cost, sticky */}
          <div className="sticky top-0 flex flex-col gap-5">
            <IngredientsCard trialId={trial.id} />
            <CostCard trialId={trial.id} />
          </div>

          {/* Right column: unified category view */}
          <div className="flex flex-col gap-5">
            <AnalysisLogCard
              trialId={trial.id}
              onOpenSensoryForm={setSensoryFormState}
            />
            <CommentsCard
              trialId={trial.id}
              onOpenEval={(logId, logLabel, evaluation: SensoryEvaluation) =>
                setSensoryFormState({ logId, logLabel, evaluation })
              }
            />
          </div>
        </div>
      </div>

      <TrialSetupModal
        open={setupModalOpen}
        onOpenChange={setSetupModalOpen}
        trialId={trial.id}
        initialSetup={setup}
        initialName={trial.name}
        key={setupModalOpen ? "open" : "closed"}
      />

      {sensoryFormState && (
        <SensoryForm
          key={`${sensoryFormState.logId}-${sensoryFormState.evaluation?.id ?? "new"}`}
          open={true}
          onOpenChange={(open) => {
            if (!open) setSensoryFormState(null);
          }}
          trialId={trial.id}
          logId={sensoryFormState.logId}
          logLabel={sensoryFormState.logLabel}
          evaluation={sensoryFormState.evaluation}
          onDelete={sensoryFormState.onDelete}
        />
      )}
    </>
  );
};
