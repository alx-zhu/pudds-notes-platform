import { useRef } from "react";
import { ImagePlus, X, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { getMediaUrl } from "@/lib/storage";
import type { DraftItem } from "@/hooks/useMediaDraft";

interface Props {
  items: DraftItem[];
  onAddFiles: (files: FileList) => void;
  onRemove: (id: string) => void;
}

/**
 * Presentational pick/preview/remove grid for an in-progress media draft.
 * Renders saved and pending picks identically (deriving each tile's src) plus
 * an add tile; selection/validation/lifecycle live in `useMediaDraft`.
 */
export const MediaGrid = ({ items, onAddFiles, onRemove }: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target.files?.length) onAddFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <div className="grid grid-cols-3 gap-2">
        {items.map((it) => {
          const id = it.kind === "pending" ? it.id : it.media.id;
          const type = it.kind === "pending" ? it.type : it.media.type;
          const src =
            it.kind === "pending" ? it.url : getMediaUrl(it.media.path);
          return (
            <div key={id} className="relative aspect-square group/media">
              {type === "video" ? (
                <video
                  src={src}
                  className="w-full h-full object-cover rounded-xl bg-muted"
                  muted
                  playsInline
                  preload="metadata"
                />
              ) : (
                <img
                  src={src}
                  alt=""
                  className="w-full h-full object-cover rounded-xl bg-muted"
                />
              )}
              {type === "video" && (
                <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="h-6 w-6 rounded-full bg-black/55 flex items-center justify-center">
                    <Play size={10} className="text-white fill-white" />
                  </span>
                </span>
              )}
              <button
                type="button"
                onClick={() => onRemove(id)}
                aria-label="Remove media"
                className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/media:opacity-100 transition-opacity cursor-pointer"
              >
                <X size={10} className="text-white" />
              </button>
            </div>
          );
        })}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "rounded-xl border-2 border-dashed border-border hover:bg-muted flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer group/add",
            items.length === 0 ? "col-span-3 py-10" : "aspect-square",
          )}
        >
          <ImagePlus
            size={items.length === 0 ? 20 : 16}
            className="text-muted-foreground group-hover/add:text-foreground transition-colors"
          />
          <span
            className={cn(
              "text-muted-foreground group-hover/add:text-foreground transition-colors",
              items.length === 0 ? "text-sm" : "text-[10px]",
            )}
          >
            {items.length === 0 ? "Add photos or video" : "Add"}
          </span>
        </button>
      </div>
    </>
  );
};
