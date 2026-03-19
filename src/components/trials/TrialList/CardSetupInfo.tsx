import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { FLAVORS, PROCESSING_TYPES } from "@/config/trial.config";
import type { TrialSetup } from "@/types/trial";

interface Props {
  setup: TrialSetup;
}

export const CardSetupInfo = ({ setup }: Props) => {
  const processingConfig = PROCESSING_TYPES.find(
    (p) => p.value === setup.processingType,
  );
  const flavorConfig = FLAVORS.find((f) => f.value === setup.flavor);

  return (
    <div className="h-full flex flex-col justify-start divide-y divide-border/40">
      <div className="flex items-center justify-between px-1 py-1.5">
        <span className="text-xs text-muted-foreground">Date</span>
        <span className="text-xs font-medium text-foreground whitespace-nowrap">
          {format(parseISO(setup.date), "MMM d, yyyy")}
        </span>
      </div>
      <div className="flex items-center justify-between px-1 py-1.5">
        <span className="text-xs text-muted-foreground">Processing</span>
        {processingConfig && (
          <Badge
            className={`${processingConfig.color} text-[11px] font-medium`}
          >
            {processingConfig.label}
          </Badge>
        )}
      </div>
      <div className="flex items-center justify-between px-1 py-1.5">
        <span className="text-xs text-muted-foreground">Flavor</span>
        {flavorConfig && (
          <Badge className={`${flavorConfig.color} text-[11px] font-medium`}>
            {flavorConfig.label}
          </Badge>
        )}
      </div>
    </div>
  );
};
