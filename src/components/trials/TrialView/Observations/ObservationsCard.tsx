import { useMemo, useState } from "react";
import { NotebookPen, Plus } from "lucide-react";
import { useReadOnly } from "@/contexts/ReadOnlyContext";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTrial, useDeleteObservation } from "@/hooks/useTrials";
import type { Observation } from "@/types/trial";
import { ObservationEntry } from "./ObservationEntry";
import { ObservationComposer } from "./ObservationComposer";
import { ObservationLightbox } from "./ObservationLightbox";

interface Props {
  trialId: string;
}

export const ObservationsCard = ({ trialId }: Props) => {
  const { data: trial } = useTrial(trialId);
  const isReadOnly = useReadOnly();
  // Newest first. createdAt is a full ISO timestamp, so same-day entries still
  // sort correctly by time.
  const observations = useMemo(
    () =>
      [...(trial?.observations ?? [])].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [trial?.observations],
  );

  const [composer, setComposer] = useState<{
    open: boolean;
    observation?: Observation;
  }>({ open: false });
  const [lightbox, setLightbox] = useState<{
    observation: Observation;
    index: number;
  } | null>(null);

  const deleteObservation = useDeleteObservation(trialId);

  const openCreate = () => setComposer({ open: true, observation: undefined });
  const openEdit = (observation: Observation) =>
    setComposer({ open: true, observation });

  // Confirmation happens in-place inside each dialog (DialogConfirm); by the
  // time these run the user has already confirmed, so just delete and close.
  const deleteAndCloseComposer = () => {
    if (composer.observation) deleteObservation.mutate(composer.observation.id);
    setComposer({ open: false });
  };
  const deleteAndCloseLightbox = () => {
    if (lightbox) deleteObservation.mutate(lightbox.observation.id);
    setLightbox(null);
  };

  return (
    <>
      <Card className="flex flex-col overflow-hidden gap-0">
        {/* ── Card Header ── */}
        <CardHeader className="px-5 py-3 space-y-0 border-b shrink-0">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2.5">
              <div className="h-6 w-6 rounded-md bg-sky-100 flex items-center justify-center shrink-0">
                <NotebookPen size={13} className="text-sky-600" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                Observations
              </p>
            </div>
            {!isReadOnly && (
              <Button size="xs" onClick={openCreate} className="gap-1">
                <Plus size={12} />
                Add observation
              </Button>
            )}
          </div>
        </CardHeader>

        {/* ── Content ── */}
        {observations.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-14">
            <div className="h-11 w-11 rounded-xl bg-muted flex items-center justify-center">
              <NotebookPen size={20} className="text-muted-foreground/50" />
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                No observations yet
              </p>
              <p className="text-xs text-muted-foreground/60 mt-0.5">
                Capture a note, photo, or video from the trial.
              </p>
            </div>
            {!isReadOnly && (
              <Button size="sm" onClick={openCreate} className="gap-1.5 mt-1">
                <Plus size={14} />
                Add observation
              </Button>
            )}
          </div>
        ) : (
          <div className="p-4 flex flex-col gap-3">
            {observations.map((o) => (
              <ObservationEntry
                key={o.id}
                observation={o}
                isReadOnly={isReadOnly}
                onEdit={() => openEdit(o)}
                onOpenLightbox={(index) => setLightbox({ observation: o, index })}
              />
            ))}
          </div>
        )}
      </Card>

      {composer.open && (
        <ObservationComposer
          open={composer.open}
          onOpenChange={(open) =>
            setComposer((c) => ({ ...c, open }))
          }
          trialId={trialId}
          observation={composer.observation}
          onDelete={deleteAndCloseComposer}
        />
      )}

      {lightbox && (
        <ObservationLightbox
          open={true}
          onOpenChange={(open) => {
            if (!open) setLightbox(null);
          }}
          observation={lightbox.observation}
          startIndex={lightbox.index}
          isReadOnly={isReadOnly}
          onEdit={() => {
            const o = lightbox.observation;
            setLightbox(null);
            openEdit(o);
          }}
          onDelete={deleteAndCloseLightbox}
        />
      )}
    </>
  );
};
