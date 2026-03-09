import { useRef } from "react";
import { Camera } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
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

  const statusBadge =
    filledCount === 0 ? (
      <Badge variant="secondary" className="text-[10px]">
        Not started
      </Badge>
    ) : allDone ? (
      <Badge className="bg-green-100 text-green-800 text-[10px]">
        Complete ✓
      </Badge>
    ) : (
      <Badge className="bg-amber-100 text-amber-800 text-[10px]">
        {filledCount} of {PHOTO_GRID_CELLS.length} uploaded
      </Badge>
    );

  return (
    <Card className="flex flex-col flex-1 min-h-0 overflow-hidden gap-0">
      <CardHeader className="py-3 px-4 flex-row items-center justify-between space-y-0 border-b shrink-0">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
            Photos
          </p>
        </div>
        {statusBadge}
      </CardHeader>
      <CardContent className="flex-1 p-4 flex flex-col gap-2 min-h-0">
        {/* Grid: [row label] [col1] [col2] */}
        <div
          className="grid gap-2 flex-1 min-h-0"
          style={{
            gridTemplateColumns: "5rem 1fr 1fr",
            gridTemplateRows: "auto 1fr 1fr",
          }}
        >
          {/* Column headers */}
          <div />
          {PHOTO_COLUMNS.map((col) => (
            <div
              key={col}
              className="bg-muted flex items-center justify-center text-[9px] font-bold uppercase tracking-wider text-muted-foreground rounded-lg py-2"
            >
              {col}
            </div>
          ))}

          {/* Rows */}
          {PHOTO_ROWS.map((row) => (
            <>
              <div
                key={`label-${row}`}
                className="bg-muted flex items-center justify-center text-center text-[9px] font-bold uppercase tracking-wider text-muted-foreground rounded-lg px-2"
              >
                {row}
              </div>
              {PHOTO_COLUMNS.map((col) => {
                const cell = PHOTO_GRID_CELLS.find(
                  (c) => c.row === row && c.col === col,
                )!;
                const hasPhoto = Boolean(photos[cell.key]);

                return (
                  <div key={`${row}-${col}`}>
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
                        "w-full h-full rounded-xl flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer",
                        hasPhoto
                          ? "border-2 border-green-300 bg-green-50"
                          : "border-2 border-dashed border-border bg-muted/50 hover:bg-muted",
                      )}
                    >
                      {hasPhoto ? (
                        <>
                          <img
                            src={photos[cell.key]}
                            alt={`${row} ${col}`}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <span className="text-[11px] font-bold text-green-700">
                            ✓ Uploaded
                          </span>
                        </>
                      ) : (
                        <>
                          <Camera
                            size={24}
                            className="text-muted-foreground/50"
                          />
                          <span className="text-[11px] text-muted-foreground/70">
                            Tap to upload
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
