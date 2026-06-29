import { Play } from "lucide-react";
import { getMediaUrl } from "@/lib/storage";
import type { MediaRef } from "@/types/media";

interface Props {
  media: MediaRef[];
  max?: number;
  onOpen: (index: number) => void;
}

/**
 * Compact, clickable thumbnail row. Shows up to `max` tiles; the last tile
 * becomes a "+N" overflow badge when there are more. Renders nothing when
 * empty.
 */
export const MediaStrip = ({ media, max = 4, onOpen }: Props) => {
  if (media.length === 0) return null;
  const visible = media.slice(0, max);
  const overflow = media.length - visible.length;

  return (
    <div className="flex flex-wrap gap-1.5">
      {visible.map((m, i) => {
        const showMore = overflow > 0 && i === max - 1;
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onOpen(i)}
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
  );
};
