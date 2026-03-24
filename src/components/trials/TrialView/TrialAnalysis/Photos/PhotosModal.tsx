import { useState, useRef } from "react";
import { Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useUpdateAnalysisLog } from "@/hooks/useTrials";
import { getLogLabel } from "@/lib/analysisLog";
import { resizeImageToBase64 } from "@/lib/image";
import { cn } from "@/lib/utils";
import type { AnalysisLog } from "@/types/trial";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trialId: string;
  log: AnalysisLog;
}

export const PhotosModal = ({ open, onOpenChange, trialId, log }: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        {open && (
          <PhotosForm
            trialId={trialId}
            log={log}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

const PhotosForm = ({
  trialId,
  log,
  onClose,
}: {
  trialId: string;
  log: AnalysisLog;
  onClose: () => void;
}) => {
  const [photos, setPhotos] = useState<string[]>(log.photos ?? []);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateMutation = useUpdateAnalysisLog(trialId);

  const handleFileChange = async (files: FileList) => {
    const newPhotos = await Promise.all(
      Array.from(files).map((f) => resizeImageToBase64(f)),
    );
    setPhotos((prev) => [...prev, ...newPhotos]);
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    updateMutation.mutate(
      { logId: log.id, input: { photos } },
      { onSuccess: onClose },
    );
  };

  return (
    <>
      <DialogHeader className="px-6 pt-6 pb-5 border-b border-border shrink-0">
        <DialogTitle>Photos</DialogTitle>
        <DialogDescription>{getLogLabel(log)}</DialogDescription>
      </DialogHeader>

      <div className="flex-1 overflow-y-auto min-h-0 px-6 py-5 bg-muted/50">
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          ref={fileInputRef}
          onChange={(e) => {
            if (e.target.files?.length) handleFileChange(e.target.files);
            e.target.value = "";
          }}
        />
        <div className="grid grid-cols-3 gap-2">
          {photos.map((src, i) => (
            <div key={i} className="relative aspect-square group/photo">
              <img
                src={src}
                alt={`Photo ${i + 1}`}
                className="w-full h-full object-cover rounded-xl"
              />
              <button
                type="button"
                onClick={() => removePhoto(i)}
                className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-opacity cursor-pointer"
              >
                <X size={10} className="text-white" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "rounded-xl border-2 border-dashed border-border hover:bg-muted flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer group/add",
              photos.length === 0 ? "col-span-3 py-10" : "aspect-square",
            )}
          >
            <Camera
              size={photos.length === 0 ? 20 : 16}
              className="text-muted-foreground group-hover/add:text-foreground transition-colors"
            />
            <span
              className={cn(
                "text-muted-foreground group-hover/add:text-foreground transition-colors",
                photos.length === 0 ? "text-sm" : "text-[10px]",
              )}
            >
              {photos.length === 0 ? "Add photos" : "Add"}
            </span>
          </button>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-border shrink-0 flex gap-3">
        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button
          size="sm"
          disabled={updateMutation.isPending}
          onClick={handleSave}
        >
          {updateMutation.isPending ? "Saving..." : "Save Photos"}
        </Button>
      </div>
    </>
  );
};
