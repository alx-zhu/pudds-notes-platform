import { Camera } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  photoSrc?: string;
  label: string;
}

export default function TrialImage({ photoSrc, label }: Props) {
  const hasPhoto = Boolean(photoSrc);

  return (
    <div className="relative h-full min-h-90">
      <div
        className={cn(
          "relative w-full h-full rounded-xl overflow-hidden flex flex-col items-center justify-center gap-3",
          hasPhoto
            ? "ring-1 ring-border/40"
            : "border-2 border-dashed border-border/60 bg-muted/20",
        )}
      >
        {hasPhoto ? (
          <img
            src={photoSrc}
            alt={label}
            className="absolute inset-0 w-full h-full object-cover"
          />
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
    </div>
  );
}
