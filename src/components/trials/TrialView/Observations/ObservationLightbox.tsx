import { useState } from "react";
import { ChevronLeft, ChevronRight, Pencil, Trash2, Play } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { getMediaUrl } from "@/lib/storage";
import { DialogConfirm } from "@/components/shared/DialogConfirm";
import type { Observation } from "@/types/trial";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  observation: Observation;
  startIndex: number;
  isReadOnly: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export const ObservationLightbox = ({
  open,
  onOpenChange,
  observation,
  startIndex,
  isReadOnly,
  onEdit,
  onDelete,
}: Props) => {
  const { media, caption, createdAt } = observation;
  const [index, setIndex] = useState(
    Math.min(Math.max(startIndex, 0), Math.max(media.length - 1, 0)),
  );
  const [confirming, setConfirming] = useState(false);
  // Note-only observations are not click-to-expand, so the lightbox only ever
  // opens with at least one media item.
  const mode = media.length === 1 ? "single" : "multi";
  const current = media[index];

  const dateLabel = format(parseISO(createdAt), "MMM d, yyyy · h:mm a");
  const dateLine =
    mode === "multi"
      ? `${dateLabel} · item ${index + 1} of ${media.length}`
      : dateLabel;

  const go = (delta: number) =>
    setIndex((i) => (i + delta + media.length) % media.length);

  const actions = !isReadOnly && (
    <div className="flex gap-2 pt-3 mt-auto border-t border-border">
      <Button variant="outline" size="sm" onClick={onEdit} className="gap-1.5">
        <Pencil size={13} />
        Edit
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setConfirming(true)}
        className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 size={13} />
        Delete
      </Button>
    </div>
  );

  const rail = (
    <div className="flex flex-col gap-3 p-5 min-w-0">
      <p className="text-xs text-muted-foreground">{dateLine}</p>
      <p
        className={cn(
          "text-sm leading-relaxed",
          !caption && "italic text-muted-foreground",
        )}
      >
        {caption || "No note"}
      </p>

      {mode === "multi" && (
        <div className="flex flex-wrap gap-1.5">
          {media.map((m, i) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`View item ${i + 1}`}
              className={cn(
                "relative h-11 w-11 rounded-md overflow-hidden bg-muted outline outline-2",
                i === index ? "outline-primary" : "outline-transparent",
              )}
            >
              {m.type === "video" ? (
                <video
                  src={getMediaUrl(m.path)}
                  className="h-full w-full object-cover"
                  muted
                  preload="metadata"
                />
              ) : (
                <img
                  src={getMediaUrl(m.path)}
                  alt=""
                  className="h-full w-full object-cover"
                />
              )}
              {m.type === "video" && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Play size={9} className="text-white fill-white" />
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {actions}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "p-0 gap-0 overflow-hidden",
          confirming ? "sm:max-w-sm" : "sm:max-w-3xl",
        )}
      >
        {confirming ? (
          <DialogConfirm
            title="Delete observation?"
            description="This will permanently delete this observation along with its photos and videos. This action cannot be undone."
            onConfirm={onDelete}
            onCancel={() => setConfirming(false)}
          />
        ) : (
          <>
            <DialogTitle className="sr-only">Observation</DialogTitle>

            <div className="grid grid-cols-[1.7fr_1fr]">
              <div className="relative bg-black flex items-center justify-center min-h-[360px]">
                {current.type === "video" ? (
                  <video
                    key={current.id}
                    src={getMediaUrl(current.path)}
                    className="max-h-[70vh] w-full"
                    controls
                    autoPlay
                  />
                ) : (
                  <img
                    key={current.id}
                    src={getMediaUrl(current.path)}
                    alt=""
                    className="max-h-[70vh] w-full object-contain"
                  />
                )}

                {mode === "multi" && (
                  <>
                    <span className="absolute top-3 left-3 rounded-md bg-black/55 text-white text-xs font-semibold px-2 py-1">
                      {index + 1} / {media.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => go(-1)}
                      aria-label="Previous"
                      className="absolute top-1/2 left-3 -translate-y-1/2 h-9 w-9 rounded-full bg-black/55 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(1)}
                      aria-label="Next"
                      className="absolute top-1/2 right-3 -translate-y-1/2 h-9 w-9 rounded-full bg-black/55 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}
              </div>
              {rail}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
