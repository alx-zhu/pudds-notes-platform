import { Button } from "@/components/ui/button";
import { DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface Props {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * In-place confirmation body, rendered *inside* an existing Dialog (swap the
 * dialog's body to this instead of opening a second dialog). Renders its own
 * DialogTitle so the host dialog still satisfies Radix's a11y requirement when
 * its normal title is swapped out.
 */
export const DialogConfirm = ({
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: Props) => (
  <div className="flex flex-col gap-4 p-6">
    <div className="flex flex-col gap-1.5">
      <DialogTitle>{title}</DialogTitle>
      {description && <DialogDescription>{description}</DialogDescription>}
    </div>
    <div className="flex justify-end gap-2">
      <Button variant="outline" size="sm" onClick={onCancel}>
        {cancelLabel}
      </Button>
      <Button variant="destructive" size="sm" onClick={onConfirm}>
        {confirmLabel}
      </Button>
    </div>
  </div>
);
