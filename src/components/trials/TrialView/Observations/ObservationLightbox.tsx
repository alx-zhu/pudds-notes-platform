import { format, parseISO } from "date-fns";
import { MediaLightbox } from "@/components/trials/shared/media/MediaLightbox";
import type { Observation } from "@/types/trial";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  observation: Observation;
  startIndex: number;
  isReadOnly: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export const ObservationLightbox = ({
  open,
  onOpenChange,
  observation,
  startIndex,
  isReadOnly,
  onEdit,
  onDelete,
}: Props) => (
  <MediaLightbox
    open={open}
    onOpenChange={onOpenChange}
    media={observation.media}
    startIndex={startIndex}
    text={observation.caption}
    meta={format(parseISO(observation.createdAt), "MMM d, yyyy · h:mm a")}
    isReadOnly={isReadOnly}
    onEdit={onEdit}
    onDelete={onDelete}
    confirmTitle="Delete observation?"
    confirmDescription="This will permanently delete this observation along with its photos and videos. This action cannot be undone."
  />
);
