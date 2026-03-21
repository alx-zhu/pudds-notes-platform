import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { FlaskConical } from "lucide-react";
import { ImageCarousel } from "@/components/trials/shared/ImageCarousel";
import { CardTabToggle } from "@/components/trials/shared/CardTabToggle";
import { CardSetupInfo } from "./CardSetupInfo";
import { CardIngredientsInfo } from "./CardIngredientsInfo";
import { CardSensoryInfo } from "./CardSensoryInfo";
import { computeCompletion } from "@/lib/completion";
import type { Trial, AnalysisLog } from "@/types/trial";
import { FLAVORS, PROCESSING_TYPES } from "@/config/trial.config";
import { getLogLabel, sortLogs } from "@/lib/analysisLog";
import type { SensoryMetricKey } from "@/config/trial.config";
import { cn } from "@/lib/utils";

type TabValue = "setup" | "ingredients" | "sensory";

const BASE_TAB_OPTIONS: { value: TabValue; label: string }[] = [
  { value: "setup", label: "Setup" },
  { value: "ingredients", label: "Ingredients" },
];

const SENSORY_TAB_OPTIONS: { value: TabValue; label: string }[] = [
  ...BASE_TAB_OPTIONS,
  { value: "sensory", label: "Sensory" },
];

interface TrialCardProps {
  trial: Trial;
  matchingLogs?: AnalysisLog[];
  sensoryFiltersActive?: boolean;
  activeMetricKeys?: SensoryMetricKey[];
}

export const TrialCard = ({
  trial,
  matchingLogs,
  sensoryFiltersActive = false,
  activeMetricKeys = [],
}: TrialCardProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabValue>("setup");
  const completion = computeCompletion(trial);

  const displayName = useMemo(() => {
    if (trial.name) return trial.name;
    const setup = trial.setup;
    if (setup) {
      const parts = [
        FLAVORS.find((f) => f.value === setup.flavor)?.label,
        PROCESSING_TYPES.find((p) => p.value === setup.processingType)?.label,
      ].filter(Boolean).join(" ");
      return parts ? `${parts} — ${format(parseISO(setup.date), "MMM d, yyyy")}` : `Trial #${trial.trialNumber}`;
    }
    return `Trial #${trial.trialNumber}`;
  }, [trial]);

  const sortedLogs = sortLogs(trial.analysisLogs);

  const logPhotosWithLabels = sortedLogs
    .filter((log) => log.photos?.[0] != null)
    .map((log) => ({
      src: log.photos![0],
      label: getLogLabel(log),
    }));

  const logPhotos = logPhotosWithLabels.map((p) => p.src);
  const logLabels = logPhotosWithLabels.map((p) => p.label);

  const tabOptions = useMemo(
    () => (sensoryFiltersActive ? SENSORY_TAB_OPTIONS : BASE_TAB_OPTIONS),
    [sensoryFiltersActive],
  );

  return (
    <div
      className="rounded-xl bg-card ring-1 ring-border/60 overflow-hidden cursor-pointer hover:shadow-lg hover:ring-border transition-all group"
      onClick={() => navigate(`/trials/${trial.id}`)}
    >
      {/* Image area — parent controls aspect ratio */}
      <div className="aspect-4/3">
        <ImageCarousel photos={logPhotos} labels={logLabels} />
      </div>

      {/* Metadata */}
      <div className="px-3 pt-2.5 pb-3 flex flex-col gap-2">
        {/* Title row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-5 w-5 rounded bg-primary/10 flex items-center justify-center shrink-0">
              <FlaskConical size={12} className="text-primary" />
            </div>
            <h3 className="text-[13px] font-semibold text-foreground truncate leading-tight">
              {displayName}
            </h3>
          </div>
          <span
            className={cn(
              "h-2 w-2 rounded-full shrink-0",
              completion.isFullyComplete
                ? "bg-emerald-500"
                : completion.completedSections > 0
                  ? "bg-amber-500"
                  : "bg-muted-foreground/30",
            )}
          />
        </div>

        {/* Tab toggle */}
        <CardTabToggle
          value={activeTab}
          onChange={setActiveTab}
          options={tabOptions}
          className="w-full"
        />

        {/* Tab content area — parent controls height, children fill it */}
        <div className="h-[104px]">
          {activeTab === "setup" ? (
            trial.setup ? (
              <CardSetupInfo setup={trial.setup} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-1.5">
                <FlaskConical size={16} className="text-muted-foreground/40" />
                <span className="text-[11px] text-muted-foreground/60">
                  No setup
                </span>
              </div>
            )
          ) : activeTab === "ingredients" ? (
            <CardIngredientsInfo variables={trial.setup?.variables ?? []} />
          ) : (
            <CardSensoryInfo
              matchingLogs={matchingLogs ?? trial.analysisLogs}
              activeMetricKeys={activeMetricKeys}
            />
          )}
        </div>
      </div>
    </div>
  );
};
