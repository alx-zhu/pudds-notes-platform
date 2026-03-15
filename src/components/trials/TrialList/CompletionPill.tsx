import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CompletionStatus } from "@/types/trial";

export const CompletionPill = ({
  label,
  status,
  detail,
}: {
  label: string;
  status: CompletionStatus;
  detail?: string;
}) => {
  return (
    <Badge
      className={cn(
        "text-[10px] font-bold rounded-full",
        status === "done" && "bg-green-100 text-green-800",
        status === "partial" && "bg-amber-100 text-amber-800",
        status === "not-started" && "bg-secondary text-secondary-foreground",
      )}
    >
      {label}
      {detail ? ` ${detail}` : status === "done" ? " ✓" : " —"}
    </Badge>
  );
};
