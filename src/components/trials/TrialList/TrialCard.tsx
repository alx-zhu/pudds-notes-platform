import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
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

  // Build metadata items for plain-text footer
  const metaItems: string[] = [];
  if (trial.setup?.date) {
    metaItems.push(format(parseISO(trial.setup.date), "MMM d, yyyy"));
  }
  if (processingConfig) metaItems.push(processingConfig.label);
  if (flavorConfig) metaItems.push(flavorConfig.label);

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
      <div className="px-4.5 pt-4 pb-3.5 flex flex-col gap-3">
        {/* Header: trial number + formulation abbreviations */}
        <div className="flex items-center gap-2.5">
          <span className="text-[22px] font-extrabold leading-none tracking-tight tabular-nums">
            {trial.trialNumber}
          </span>
          {formulation.length > 0 && (
            <span className="text-sm font-semibold leading-none">
              {formulation.map((item, i) => (
                <span key={item.abbreviation + i}>
                  {i > 0 && (
                    <span className="text-muted-foreground font-normal mx-0.5">
                      +
                    </span>
                  )}
                  {item.abbreviation}
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

        {/* Score source */}
        {recentEval ? (
          <p className="text-[11px] text-muted-foreground italic flex justify-end">
            Source: {recentEval.label}
          </p>
        ) : (
          <p className="text-[11px] text-muted-foreground/40 italic">
            No evaluations yet
          </p>
        )}

        {/* Metadata footer — plain muted text, no colored badges */}
        {metaItems.length > 0 && (
          <div className="flex justify-end items-center gap-1.5 flex-wrap pt-2.5 mt-0.5 border-t border-border/50">
            {metaItems.map((item, i) => (
              <span key={item} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-xs text-border">·</span>}
                <span className="text-xs text-muted-foreground font-medium">
                  {item}
                </span>
              </span>
            ))}
          </div>
        )}
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
    <div className="flex items-center gap-3.5">
      <div className="flex flex-col items-center min-w-[50px]">
        <span className="text-[28px] font-extrabold leading-none tracking-tight">
          {scores.overall != null ? scores.overall.toFixed(1) : "—"}
        </span>
        <span className="text-[11px] font-medium text-muted-foreground mt-1">
          Overall
        </span>
      </div>

      <div className="w-px h-9 bg-border" />

      <div className="flex-1 flex flex-col gap-1.5">
        {scores.categories.map((cat) => {
          const style = SENSORY_CATEGORY_STYLES[cat.key];
          const pct =
            cat.score != null ? (cat.score / SENSORY_MAX_SCORE) * 100 : 0;
          return (
            <div key={cat.key} className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground w-[52px] text-right">
                {cat.label}
              </span>
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
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
                  "text-xs font-bold tabular-nums w-[26px] text-right",
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
    <div className="flex items-center gap-3.5">
      <div className="flex flex-col items-center min-w-[50px]">
        <span className="text-[28px] font-extrabold leading-none tracking-tight text-border">
          —
        </span>
        <span className="text-[11px] font-medium text-muted-foreground/50 mt-1">
          Overall
        </span>
      </div>

      <div className="w-px h-9 bg-border/40" />

      <div className="flex-1 flex flex-col gap-1.5">
        {categories.map((label) => (
          <div key={label} className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground/40 w-[52px] text-right">
              {label}
            </span>
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden" />
            <span className="text-xs font-bold tabular-nums w-[26px] text-right text-border">
              —
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
