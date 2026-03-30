import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { ImageCarousel } from "@/components/trials/shared/ImageCarousel";
import {
  FLAVORS,
  PROCESSING_TYPES,
  SENSORY_CATEGORY_STYLES,
  SENSORY_MAX_SCORE,
} from "@/config/trial.config";
import {
  getPinnedFormulation,
  getMostRecentEval,
  getTrialPhotos,
} from "@/lib/trialDisplay";
import type { Trial } from "@/types/trial";
import type { CategoryScore } from "@/lib/sensoryScores";
import { cn } from "@/lib/utils";

interface TrialCardProps {
  trial: Trial;
}

export const TrialCard = ({ trial }: TrialCardProps) => {
  const navigate = useNavigate();

  const formulation = useMemo(
    () => getPinnedFormulation(trial.ingredients),
    [trial.ingredients],
  );

  const recentEval = useMemo(() => getMostRecentEval(trial), [trial]);

  const photos = useMemo(() => {
    const items = getTrialPhotos(trial.analysisLogs);
    return { srcs: items.map((p) => p.src), labels: items.map((p) => p.label) };
  }, [trial.analysisLogs]);

  const processingConfig = PROCESSING_TYPES.find(
    (p) => p.value === trial.setup?.processingType,
  );
  const flavorConfig = FLAVORS.find((f) => f.value === trial.setup?.flavor);

  return (
    <div
      className="rounded-xl bg-card ring-1 ring-border/60 overflow-hidden cursor-pointer hover:shadow-lg hover:ring-border transition-all"
      onClick={() => navigate(`/trials/${trial.id}`)}
    >
      {/* Image — 4:3 aspect ratio */}
      <div className="aspect-4/3">
        <ImageCarousel photos={photos.srcs} labels={photos.labels} />
      </div>

      {/* Content below image */}
      <div className="px-3.5 pt-3 pb-3 flex flex-col gap-2.5">
        {/* Header: trial number badge + formulation */}
        <div className="flex items-start gap-2.5">
          <span className="inline-flex items-center shrink-0 px-1.5 py-0.5 rounded-md bg-muted text-foreground text-sm font-normal tabular-nums tracking-tight">
            #{trial.trialNumber}
          </span>
          {formulation.length > 0 && (
            <span className="text-[13px] font-medium text-foreground leading-snug pt-0.5">
              {formulation.map((item, i) => (
                <span key={item.abbreviation + i}>
                  {i > 0 && <span className="text-border mx-0.5">/</span>}
                  <span className="font-bold">{item.abbreviation}</span>{" "}
                  <span className="text-muted-foreground tabular-nums">
                    {item.percentage}%
                  </span>
                </span>
              ))}
            </span>
          )}
        </div>

        {/* Scores */}
        {recentEval ? (
          <ScoreDisplay scores={recentEval.scores} />
        ) : (
          <ScoreEmptyState />
        )}

        {/* Metadata footer */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          {trial.setup?.date && (
            <span className="text-[11px] text-muted-foreground font-medium">
              {format(parseISO(trial.setup.date), "MMM d, yyyy")}
            </span>
          )}
          {processingConfig && (
            <>
              <span className="text-[11px] text-border">·</span>
              <Badge
                className={cn(
                  "text-[11px] font-medium",
                  processingConfig.color,
                )}
              >
                {processingConfig.label}
              </Badge>
            </>
          )}
          {flavorConfig && (
            <>
              <span className="text-[11px] text-border">·</span>
              <Badge
                className={cn("text-[11px] font-medium", flavorConfig.color)}
              >
                {flavorConfig.label}
              </Badge>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Score display (with data) ── */

function ScoreDisplay({
  scores,
}: {
  scores: { categories: CategoryScore[]; overall: number | null };
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-col items-center min-w-12">
        <span className="text-2xl font-extrabold leading-none tracking-tight">
          {scores.overall != null ? scores.overall.toFixed(1) : "—"}
        </span>
        <span className="text-[10px] font-medium text-muted-foreground mt-0.5">
          Overall
        </span>
      </div>

      <div className="w-px h-8 bg-border" />

      <div className="flex-1 flex flex-col gap-1.5">
        {scores.categories.map((cat) => {
          const style = SENSORY_CATEGORY_STYLES[cat.key];
          const pct =
            cat.score != null ? (cat.score / SENSORY_MAX_SCORE) * 100 : 0;
          return (
            <div key={cat.key} className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-muted-foreground w-12 text-right">
                {cat.label}
              </span>
              <div className="flex-1 h-[5px] bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full",
                    style?.bar ?? "bg-primary",
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span
                className={cn(
                  "text-[11px] font-semibold tabular-nums w-6 text-right",
                  style?.number ?? "text-foreground",
                )}
              >
                {cat.score != null ? cat.score.toFixed(1) : "—"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Score empty state (same layout, ghosted) ── */

function ScoreEmptyState() {
  const categories = ["Taste", "Texture", "Color"];

  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-col items-center min-w-12">
        <span className="text-2xl font-extrabold leading-none tracking-tight text-border">
          —
        </span>
        <span className="text-[10px] font-medium text-muted-foreground/50 mt-0.5">
          Overall
        </span>
      </div>

      <div className="w-px h-8 bg-border/40" />

      <div className="flex-1 flex flex-col gap-1.5">
        {categories.map((label) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium text-muted-foreground/40 w-12 text-right">
              {label}
            </span>
            <div className="flex-1 h-[5px] bg-muted rounded-full overflow-hidden" />
            <span className="text-[11px] font-semibold tabular-nums w-6 text-right text-border">
              —
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
