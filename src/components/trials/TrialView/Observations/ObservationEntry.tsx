import { Pencil } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { MediaStrip } from "@/components/trials/shared/media/MediaStrip";
import type { Observation } from "@/types/trial";

interface Props {
  observation: Observation;
  isReadOnly: boolean;
  onEdit: () => void;
  onOpenLightbox: (index: number) => void;
}

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
        <div className="mt-3">
          <MediaStrip media={media} onOpen={onOpenLightbox} />
        </div>
      )}

      <p className="text-[11px] text-muted-foreground mt-2.5">
        {mediaMeta(observation)}
      </p>
    </div>
  );
};
