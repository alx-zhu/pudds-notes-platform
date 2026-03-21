import { useState } from "react";
import { Camera, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  photos?: string[];
  label: string;
  onAddPhoto?: () => void;
}

export const TrialImage = ({ photos = [], label, onAddPhoto }: Props) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const hasPhotos = photos.length > 0;
  const clampedIndex = Math.min(activeIndex, photos.length - 1);

  return (
    <div
      className={cn(
        "relative w-full h-full min-h-90 rounded-xl overflow-hidden flex flex-col items-center justify-center gap-3",
        hasPhotos
          ? "ring-1 ring-border/40"
          : "border-2 border-dashed border-border/60 bg-muted/20",
        !hasPhotos && onAddPhoto && "cursor-pointer hover:bg-muted/40 transition-colors",
      )}
      onClick={!hasPhotos && onAddPhoto ? onAddPhoto : undefined}
    >
      {hasPhotos ? (
        <div className="group/img">
          <img
            src={photos[clampedIndex]}
            alt={label}
            className="absolute inset-0 w-full h-full object-cover"
          />

          {onAddPhoto && (
            <button
              type="button"
              onClick={onAddPhoto}
              className="absolute top-2.5 right-2.5 h-7 w-7 rounded-lg bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity cursor-pointer hover:bg-black/70"
            >
              <Pencil size={12} className="text-white" />
            </button>
          )}

          {photos.length > 1 && (
            <div className="absolute bottom-2.5 inset-x-0 flex gap-1.5 justify-center px-3">
              {photos.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  className={cn(
                    "h-9 w-9 rounded-lg overflow-hidden ring-2 transition-all cursor-pointer shrink-0 shadow-md",
                    i === clampedIndex
                      ? "ring-white"
                      : "ring-transparent opacity-60 hover:opacity-90",
                  )}
                >
                  <img
                    src={src}
                    alt={`Photo ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="h-12 w-12 rounded-xl bg-muted/60 flex items-center justify-center">
            <Camera size={20} className="text-muted-foreground/50" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground/70">
              No photo
            </p>
            <p className="text-xs text-muted-foreground/40 mt-0.5">{label}</p>
          </div>
        </>
      )}
    </div>
  );
};
