import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { Camera, FlaskConical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CompletionPill } from "./CompletionPill";
import { computeCompletion, isLogComplete } from "@/lib/completion";
import { FLAVORS, PROCESSING_TYPES } from "@/config/trial.config";
import type { Trial } from "@/types/trial";
import { cn } from "@/lib/utils";

function PhotoGrid({ trial }: { trial: Trial }) {
  const logPhotos = trial.analysisLogs
    .map((log) => log.photo)
    .filter((p): p is string => Boolean(p));

  if (logPhotos.length === 0) {
    return (
      <div className="aspect-[2/1] bg-muted/40 flex flex-col items-center justify-center gap-2 rounded-t-xl">
        <div className="h-10 w-10 rounded-lg bg-muted/80 flex items-center justify-center">
          <Camera size={18} className="text-muted-foreground/40" />
        </div>
        <span className="text-xs text-muted-foreground/50">No photos</span>
      </div>
    );
  }

  const displayPhotos = logPhotos.slice(0, 4);
  const cols = displayPhotos.length === 1 ? 1 : 2;
  return (
    <div
      className={cn(
        "grid rounded-t-xl overflow-hidden aspect-[2/1]",
        cols === 1 ? "grid-cols-1" : "grid-cols-2",
      )}
    >
      {displayPhotos.map((src, i) => (
        <img key={i} src={src} alt="" className="w-full h-full object-cover" />
      ))}
    </div>
  );
}

export function TrialCard({ trial }: { trial: Trial }) {
  const navigate = useNavigate();
  const completion = computeCompletion(trial);
  const setup = trial.setup;
  const completedLogs = trial.analysisLogs.filter(isLogComplete).length;

  const flavorConfig = setup
    ? FLAVORS.find((f) => f.value === setup.flavor)
    : null;
  const processingConfig = setup
    ? PROCESSING_TYPES.find((p) => p.value === setup.processingType)
    : null;

  const variablesText = setup?.variables
    .map((v) => `${v.ingredient} ${v.percentage}%`)
    .join(" · ");

  return (
    <div
      className="rounded-xl bg-card ring-1 ring-border/60 overflow-hidden cursor-pointer hover:shadow-lg hover:ring-border transition-all group"
      onClick={() => navigate(`/trials/${trial.id}`)}
    >
      {/* Photo grid — top half */}
      <PhotoGrid trial={trial} />

      {/* Metadata — bottom half */}
      <div className="p-4 flex flex-col gap-3">
        {/* Title row */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <div className="h-5 w-5 rounded bg-primary/10 flex items-center justify-center shrink-0">
                <FlaskConical size={11} className="text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-foreground truncate">
                {trial.name || `Trial #${trial.trialNumber}`}
              </h3>
            </div>
            {setup?.date && (
              <p className="text-xs text-muted-foreground ml-7">
                {format(parseISO(setup.date), "MMM d, yyyy")}
              </p>
            )}
          </div>
          <div
            className={cn(
              "flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-medium shrink-0 mt-0.5",
              completion.isFullyComplete
                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                : completion.completedSections > 0
                  ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                  : "bg-muted text-muted-foreground ring-1 ring-border/40",
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                completion.isFullyComplete
                  ? "bg-emerald-500"
                  : completion.completedSections > 0
                    ? "bg-amber-500"
                    : "bg-muted-foreground/40",
              )}
            />
            {completion.isFullyComplete
              ? "Complete"
              : `${completion.completedSections}/2`}
          </div>
        </div>

        {/* Badges row */}
        {(flavorConfig || processingConfig) && (
          <div className="flex gap-1.5 flex-wrap">
            {flavorConfig && (
              <Badge className={cn("text-[10px] font-medium", flavorConfig.color)}>
                {flavorConfig.label}
              </Badge>
            )}
            {processingConfig && (
              <Badge className={cn("text-[10px] font-medium", processingConfig.color)}>
                {processingConfig.label}
              </Badge>
            )}
          </div>
        )}

        {/* Ingredients */}
        {variablesText && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {variablesText}
          </p>
        )}

        {/* Completion pills */}
        <div className="flex items-center justify-between pt-1 border-t border-border/30">
          <div className="flex gap-1.5">
            <CompletionPill label="Setup" status={completion.setup} />
            <CompletionPill
              label="Logs"
              status={completion.analysisLogs}
              detail={
                trial.analysisLogs.length > 0
                  ? `${completedLogs}/${trial.analysisLogs.length}`
                  : undefined
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
