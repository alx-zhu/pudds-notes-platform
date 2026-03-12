import { useRef } from "react";
import { Camera, ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useTrial, useUpdatePhotoGrid } from "@/hooks/useTrials";
import {
  PHOTO_ROWS,
  PHOTO_COLUMNS,
  PHOTO_GRID_CELLS,
} from "@/config/trial.config";
import type { PhotoSlot } from "@/config/trial.config";
import { cn } from "@/lib/utils";

interface Props {
  trialId: string;
}

async function resizeImageToBase64(file: File, maxPx = 800): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas
        .getContext("2d")!
        .drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  });
}

export default function PhotoGridCard({ trialId }: Props) {
  const { data: trial } = useTrial(trialId);
  const mutation = useUpdatePhotoGrid(trialId);
  const fileRefs = useRef<Record<PhotoSlot, HTMLInputElement | null>>(
    {} as Record<PhotoSlot, HTMLInputElement | null>,
  );

  const photos = trial?.photos ?? {};
  const filledCount = PHOTO_GRID_CELLS.filter(({ key }) =>
    Boolean(photos[key]),
  ).length;
  const allDone = filledCount === PHOTO_GRID_CELLS.length;

  async function handleFileChange(slot: PhotoSlot, file: File) {
    const dataUrl = await resizeImageToBase64(file);
    mutation.mutate({ ...photos, [slot]: dataUrl });
  }

  return (
    <Card className="flex flex-col overflow-hidden gap-0">
      <CardHeader className="py-3 px-5 flex items-center justify-between border-b shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="h-6 w-6 rounded-md bg-orange-100 flex items-center justify-center">
            <ImageIcon size={13} className="text-orange-600" />
          </div>
          <p className="text-sm font-semibold text-foreground">Photos</p>
        </div>
        {filledCount === 0 ? (
          <span className="text-xs text-muted-foreground">Not started</span>
        ) : (
          <div
            className={cn(
              "flex items-center gap-1.5 text-xs font-medium",
              allDone ? "text-emerald-600" : "text-amber-600",
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                allDone ? "bg-emerald-500" : "bg-amber-500",
              )}
            />
            {allDone
              ? "Complete"
              : `${filledCount}/${PHOTO_GRID_CELLS.length} uploaded`}
          </div>
        )}
      </CardHeader>

      <CardContent className="p-5 flex flex-col gap-3">
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: "5rem 1fr 1fr",
          }}
        >
          {/* Column headers */}
          <div />
          {PHOTO_COLUMNS.map((col) => (
            <div
              key={col}
              className="bg-muted/60 flex items-center justify-center text-xs font-semibold uppercase tracking-wide text-muted-foreground rounded-lg py-2"
            >
              {col}
            </div>
          ))}

          {/* Rows */}
          {PHOTO_ROWS.map((row) => (
            <>
              <div
                key={`label-${row}`}
                className="bg-muted/60 flex items-center justify-center text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground rounded-lg px-2"
              >
                {row}
              </div>
              {PHOTO_COLUMNS.map((col) => {
                const cell = PHOTO_GRID_CELLS.find(
                  (c) => c.row === row && c.col === col,
                )!;
                const hasPhoto = Boolean(photos[cell.key]);

                return (
                  <div key={`${row}-${col}`} className="aspect-square">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={(el) => {
                        fileRefs.current[cell.key] = el;
                      }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileChange(cell.key, file);
                        e.target.value = "";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => fileRefs.current[cell.key]?.click()}
                      className={cn(
                        "relative w-full h-full rounded-xl overflow-hidden flex flex-col items-center justify-center gap-2 transition-all cursor-pointer group/upload",
                        hasPhoto
                          ? "ring-2 ring-emerald-200 hover:ring-emerald-300"
                          : "border-2 border-dashed border-border/60 bg-muted/20 hover:bg-muted/40 hover:border-border",
                      )}
                    >
                      {hasPhoto ? (
                        <>
                          <img
                            src={photos[cell.key]}
                            alt={`${row} ${col}`}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          {/* <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-medium text-white bg-emerald-600/80 backdrop-blur-sm px-2 py-0.5 rounded-full whitespace-nowrap">
                            ✓ Uploaded
                          </span> */}
                        </>
                      ) : (
                        <>
                          <div className="h-10 w-10 rounded-lg bg-muted/60 flex items-center justify-center group-hover/upload:bg-muted transition-colors">
                            <Camera
                              size={18}
                              className="text-muted-foreground/50 group-hover/upload:text-muted-foreground transition-colors"
                            />
                          </div>
                          <span className="text-xs text-muted-foreground/50 group-hover/upload:text-muted-foreground transition-colors">
                            Upload
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
