import { useState } from "react";
import { Camera, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  photos: string[];
  labels?: string[];
  className?: string;
}

export const ImageCarousel = ({ photos, labels, className }: Props) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const hasPhotos = photos.length > 0;
  const clampedIndex = Math.min(activeIndex, Math.max(photos.length - 1, 0));

  if (!hasPhotos) {
    return (
      <div
        className={cn(
          "w-full h-full bg-muted/40 flex flex-col items-center justify-center gap-2",
          className,
        )}
      >
        <div className="h-10 w-10 rounded-lg bg-muted/80 flex items-center justify-center">
          <Camera size={18} className="text-muted-foreground/40" />
        </div>
        <span className="text-xs text-muted-foreground/50">No photos</span>
      </div>
    );
  }

  return (
    <div className={cn("relative w-full h-full overflow-hidden", className)}>
      <img
        src={photos[clampedIndex]}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Storage label badge */}
      {labels?.[clampedIndex] && (
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium leading-tight">
          {labels[clampedIndex]}
        </div>
      )}

      {/* Left arrow */}
      {clampedIndex > 0 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setActiveIndex(clampedIndex - 1);
          }}
          className="absolute left-1.5 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center transition-colors cursor-pointer"
        >
          <ChevronLeft size={14} className="text-white" />
        </button>
      )}

      {/* Right arrow */}
      {clampedIndex < photos.length - 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setActiveIndex(clampedIndex + 1);
          }}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center transition-colors cursor-pointer"
        >
          <ChevronRight size={14} className="text-white" />
        </button>
      )}

      {/* Dot indicators */}
      {photos.length > 1 && (
        <div className="absolute bottom-1.5 inset-x-0 flex justify-center">
          <div className="flex gap-1 bg-black/40 rounded-full px-2 py-1">
            {photos.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex(i);
                }}
                className={cn(
                  "h-1.5 w-1.5 rounded-full transition-colors cursor-pointer",
                  i === clampedIndex ? "bg-white" : "bg-white/50",
                )}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
