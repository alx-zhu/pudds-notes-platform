import { useRef, forwardRef, useImperativeHandle } from "react";
import { Camera } from "lucide-react";
import { useTrial, useUpdatePhotoGrid } from "@/hooks/useTrials";
import type { PhotoSlot } from "@/config/trial.config";
import { resizeImageToBase64 } from "@/lib/image";
import { cn } from "@/lib/utils";

export interface CategoryImagePanelHandle {
  triggerUpload: () => void;
}

interface Props {
  trialId: string;
  photoSlot: PhotoSlot;
  categoryLabel: string;
}

const CategoryImagePanel = forwardRef<CategoryImagePanelHandle, Props>(
  function CategoryImagePanel({ trialId, photoSlot, categoryLabel }, ref) {
    const { data: trial } = useTrial(trialId);
    const mutation = useUpdatePhotoGrid(trialId);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const photos = trial?.photos ?? {};
    const photoSrc = photos[photoSlot];
    const hasPhoto = Boolean(photoSrc);

    useImperativeHandle(ref, () => ({
      triggerUpload: () => fileInputRef.current?.click(),
    }));

    async function handleFileChange(file: File) {
      const dataUrl = await resizeImageToBase64(file);
      mutation.mutate({ ...photos, [photoSlot]: dataUrl });
    }

    return (
      <div className="relative h-full min-h-[360px]">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileChange(file);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "relative w-full h-full rounded-xl overflow-hidden flex flex-col items-center justify-center gap-3 transition-all cursor-pointer group/upload",
            hasPhoto
              ? "ring-1 ring-border/40 hover:ring-border"
              : "border-2 border-dashed border-border/60 bg-muted/20 hover:bg-muted/40 hover:border-border",
          )}
        >
          {hasPhoto ? (
            <>
              <img
                src={photoSrc}
                alt={categoryLabel}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover/upload:bg-black/10 transition-colors" />
              <div className="absolute bottom-3 right-3 h-8 w-8 rounded-lg bg-card/90 backdrop-blur-sm flex items-center justify-center shadow-sm ring-1 ring-border/40 opacity-0 group-hover/upload:opacity-100 transition-opacity">
                <Camera size={14} className="text-muted-foreground" />
              </div>
            </>
          ) : (
            <>
              <div className="h-12 w-12 rounded-xl bg-muted/60 flex items-center justify-center group-hover/upload:bg-muted transition-colors">
                <Camera
                  size={20}
                  className="text-muted-foreground/50 group-hover/upload:text-muted-foreground transition-colors"
                />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground/70 group-hover/upload:text-muted-foreground transition-colors">
                  Upload photo
                </p>
                <p className="text-xs text-muted-foreground/40 mt-0.5">
                  {categoryLabel}
                </p>
              </div>
            </>
          )}
        </button>
      </div>
    );
  },
);

export default CategoryImagePanel;
