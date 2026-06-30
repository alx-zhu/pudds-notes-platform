import { useState } from "react";
import { Flame, Pencil, Plus } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MediaStrip } from "@/components/trials/shared/media/MediaStrip";
import { MediaLightbox } from "@/components/trials/shared/media/MediaLightbox";
import { useReadOnly } from "@/contexts/ReadOnlyContext";
import { useTrial } from "@/hooks/useTrials";
import { decomposeMinutes } from "@/lib/storageTime";
import { FoulingDialog } from "./FoulingDialog";

interface Props {
  trialId: string;
}

export const FoulingCard = ({ trialId }: Props) => {
  const { data: trial } = useTrial(trialId);
  const isReadOnly = useReadOnly();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const fouling = trial?.fouling;
  const media = fouling?.media ?? [];

  const timeDisplay =
    fouling?.didFoul && fouling.timeToFoulingMinutes != null
      ? decomposeMinutes(fouling.timeToFoulingMinutes)
      : null;

  const lightboxMeta = fouling
    ? fouling.didFoul
      ? timeDisplay
        ? `Fouled · ${timeDisplay.value} ${timeDisplay.unit}`
        : "Fouled"
      : "Did not foul"
    : undefined;

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <>
      <Card className="flex flex-col overflow-hidden gap-0 shrink-0">
        <CardHeader className="py-3 px-5 space-y-0 border-b shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded bg-amber-100 flex items-center justify-center">
                <Flame size={11} className="text-amber-600" />
              </div>
              <span className="text-sm font-semibold text-foreground">
                Fouling
              </span>
            </div>
            {!isReadOnly && fouling != null && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setDialogOpen(true)}
                className="h-7 w-7 p-0"
              >
                <Pencil size={13} />
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="px-5 py-4 flex flex-col gap-3">
          {fouling == null ? (
            <div className="flex flex-col items-center justify-center gap-4 py-4">
              <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                <Flame size={20} className="text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground mb-1">
                  No fouling result recorded
                </p>
              </div>
              {!isReadOnly && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDialogOpen(true)}
                >
                  <Plus size={13} className="mr-1" />
                  Add fouling result
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Status row — dot + label + (gated) inline time badge */}
              <div className="flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full shrink-0 ${
                    fouling.didFoul
                      ? "bg-destructive"
                      : "bg-muted-foreground/40"
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    fouling.didFoul
                      ? "text-destructive"
                      : "text-muted-foreground"
                  }`}
                >
                  {fouling.didFoul ? "Did foul" : "Did not foul"}
                </span>
                {timeDisplay != null && (
                  <span className="ml-auto text-xs text-muted-foreground bg-muted rounded-md px-2 py-1 tabular-nums">
                    {timeDisplay.value} {timeDisplay.unit} to foul
                  </span>
                )}
              </div>

              {/* Notes — any outcome */}
              {fouling.notes && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                    Notes
                  </p>
                  <p className="text-sm leading-relaxed">{fouling.notes}</p>
                </div>
              )}

              {/* Media — any outcome */}
              {media.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                    Photos &amp; video
                  </p>
                  <MediaStrip media={media} onOpen={openLightbox} />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <FoulingDialog
        trialId={trialId}
        initialFouling={fouling}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      {media.length > 0 && lightboxOpen && (
        <MediaLightbox
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
          media={media}
          startIndex={lightboxIndex}
          text={fouling?.notes}
          meta={lightboxMeta}
          isReadOnly={isReadOnly}
          onEdit={() => {
            setLightboxOpen(false);
            setDialogOpen(true);
          }}
        />
      )}
    </>
  );
};
