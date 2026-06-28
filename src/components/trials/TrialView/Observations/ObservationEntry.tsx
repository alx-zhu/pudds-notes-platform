import { Pencil, Play } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { getMediaUrl } from "@/lib/storage";
import type { Observation } from "@/types/trial";

interface Props {
  observation: Observation;
  isReadOnly: boolean;
  onEdit: () => void;
  onOpenLightbox: (index: number) => void;
}

const MAX_TILES = 4;

const mediaMeta = (observation: Observation): string => {
  const parts = [format(parseISO(observation.createdAt), "MMM d, yyyy")];
  const images = observation.media.filter((m) => m.type === "image").length;
  const videos = observation.media.filter((m) => m.type === "video").length;
  if (observation.media.length === 0) {
    parts.push("note only");
  } else {
    if (images) parts.push(`${images} photo${images > 1 ? "s" : ""}`);
    if (videos) parts.push(`${videos} video${videos > 1 ? "s" : ""}`);
  }
  return parts.join(" · ");
};

export const ObservationEntry = ({
  observation,
  isReadOnly,
  onEdit,
  onOpenLightbox,
}: Props) => {
  const { caption, media } = observation;
  const visible = media.slice(0, MAX_TILES);
  const overflow = media.length - visible.length;

  return (
    <div className="relative rounded-xl border border-border p-3.5">
      {!isReadOnly && (
        <button
          type="button"
          onClick={onEdit}
          aria-label="Edit observation"
          className="absolute top-3 right-3 h-6 w-6 rounded-md bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer transition-colors"
        >
          <Pencil size={12} />
        </button>
      )}

      <p
        className={cn(
          "text-sm leading-relaxed pr-7",
          !caption && "italic text-muted-foreground",
        )}
      >
        {caption || "No note"}
      </p>

      {media.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {visible.map((m, i) => {
            const showMore = overflow > 0 && i === MAX_TILES - 1;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onOpenLightbox(i)}
                aria-label="Open media"
                className="relative h-16 w-16 rounded-lg overflow-hidden outline outline-1 outline-border bg-muted cursor-zoom-in"
              >
                {m.type === "video" ? (
                  <video
                    src={getMediaUrl(m.path)}
                    className="h-full w-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <img
                    src={getMediaUrl(m.path)}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                )}
                {m.type === "video" && !showMore && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="h-5 w-5 rounded-full bg-black/55 flex items-center justify-center">
                      <Play size={9} className="text-white fill-white" />
                    </span>
                  </span>
                )}
                {showMore && (
                  <span className="absolute inset-0 bg-black/55 text-white text-sm font-semibold flex items-center justify-center">
                    +{overflow}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <p className="text-[11px] text-muted-foreground mt-2.5">
        {mediaMeta(observation)}
      </p>
    </div>
  );
};
