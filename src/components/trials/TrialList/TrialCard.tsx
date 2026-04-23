import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, EllipsisVertical } from "lucide-react";
import { useReadOnly } from "@/contexts/ReadOnlyContext";
import { ImageCarousel } from "@/components/trials/shared/ImageCarousel";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FLAVORS,
  SENSORY_CATEGORY_STYLES,
  SENSORY_MAX_SCORE,
} from "@/config/trial.config";
import {
  getPinnedFormulation,
  getMostRecentEval,
  getTrialPhotos,
} from "@/lib/trialDisplay";
import type { Trial } from "@/types/trial";
import type { SortByScore } from "@/types/filters";
import type { CategoryScore } from "@/lib/sensoryScores";
import { cn } from "@/lib/utils";

interface TrialCardProps {
  trial: Trial;
  sortBy: SortByScore;
  onDelete: (id: string) => void;
  onSelect?: (id: string) => void;
}

export const TrialCard = ({
  trial,
  sortBy,
  onDelete,
  onSelect,
}: TrialCardProps) => {
  const navigate = useNavigate();
  const isReadOnly = useReadOnly();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const formulation = useMemo(
    () => getPinnedFormulation(trial.ingredients),
    [trial.ingredients],
  );

  const recentEval = useMemo(() => getMostRecentEval(trial), [trial]);

  const photos = useMemo(() => {
    const items = getTrialPhotos(trial.analysisLogs);
    return { srcs: items.map((p) => p.src), labels: items.map((p) => p.label) };
  }, [trial.analysisLogs]);

  const flavorConfig = FLAVORS.find((f) => f.value === trial.setup?.flavor);

  return (
    <>
    <div
      className="rounded-xl bg-card ring-1 ring-border/60 overflow-hidden cursor-pointer hover:shadow-lg hover:ring-border transition-all"
      onClick={() =>
        onSelect ? onSelect(trial.id) : navigate(`/trials/${trial.id}`)
      }
    >
      {/* Image — 4:3 aspect ratio */}
      <div className="aspect-4/3 relative">
        <ImageCarousel photos={photos.srcs} labels={photos.labels} />
        {!isReadOnly && (
          <div className="absolute top-2 right-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="h-7 w-7 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white transition-colors cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <EllipsisVertical size={14} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmOpen(true);
                  }}
                >
                  <Trash2 size={14} />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Content below image */}
      <div className="px-4.5 pt-3.5 pb-3.5 flex flex-col gap-4">
        {/* Header: trial number badge + formulation + flavor badge */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center min-w-[26px] h-[22px] px-1.5 rounded-md bg-muted text-[13px] font-bold tabular-nums leading-none">
            {trial.trialNumber}
          </span>
          {formulation.length > 0 ? (
            <span className="text-[13px] font-medium leading-none">
              {formulation.map((item, i) => (
                <span key={item.abbreviation + i}>
                  {i > 0 && <span className="text-border mx-1">/</span>}
                  <span className="font-bold">{item.abbreviation}</span>{" "}
                  <span className="text-muted-foreground tabular-nums">
                    {item.percentage}%
                  </span>
                </span>
              ))}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground/60 italic">
              No pinned ingredients
            </span>
          )}
          {flavorConfig && (
            <span
              className={cn(
                "inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium leading-none ml-auto",
                flavorConfig.color,
              )}
            >
              {flavorConfig.label}
            </span>
          )}
        </div>

        {/* Scores */}
        {recentEval ? (
          <ScoreDisplay scores={recentEval.scores} sortBy={sortBy} />
        ) : (
          <ScoreEmptyState />
        )}

        {/* Score source */}
        {recentEval ? (
          <p className="text-[11px] text-muted-foreground italic flex justify-end">
            Source: {recentEval.label}
          </p>
        ) : (
          <p className="text-[11px] text-muted-foreground/40 italic flex justify-end">
            No evaluations yet
          </p>
        )}
      </div>

    </div>

    <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete trial?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the trial and all its data. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => onDelete(trial.id)}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
};

/* ── Score display (with data) ── */

function ScoreDisplay({
  scores,
  sortBy,
}: {
  scores: { categories: CategoryScore[]; overall: number | null };
  sortBy: SortByScore;
}) {
  const hasSortEmphasis = sortBy != null && sortBy !== "overall";

  return (
    <div className="flex items-center gap-3.5">
      <div
        className={cn(
          "flex flex-col items-center min-w-[50px] transition-opacity",
          hasSortEmphasis && "opacity-40",
        )}
      >
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
          const isEmphasized = sortBy === cat.key;
          const isDimmed = hasSortEmphasis && !isEmphasized;

          return (
            <div
              key={cat.key}
              className={cn(
                "flex items-center gap-2 transition-opacity",
                isDimmed && "opacity-40",
              )}
            >
              <span
                className={cn(
                  "text-xs font-medium text-muted-foreground w-[52px] text-right",
                  isEmphasized && "text-foreground font-semibold",
                )}
              >
                {cat.label}
              </span>
              <div
                className={cn(
                  "flex-1 h-1.5 bg-muted rounded-full overflow-hidden transition-all",
                  isEmphasized && "h-2",
                )}
              >
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
                  isEmphasized && "text-[13px] font-extrabold",
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
