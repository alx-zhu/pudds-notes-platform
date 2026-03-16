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
    <div className="h-full flex flex-col justify-start divide-y divide-border/30">
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-[11px] text-muted-foreground">Date</span>
        <span className="text-[11px] font-medium text-foreground">
          {format(parseISO(setup.date), "MMM d, yyyy")}
        </span>
      </div>
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-[11px] text-muted-foreground">Processing</span>
        {processingConfig && (
          <Badge
            className={`${processingConfig.color} text-[10px] font-medium`}
          >
            {processingConfig.label}
          </Badge>
        )}
      </div>
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-[11px] text-muted-foreground">Flavor</span>
        {flavorConfig && (
          <Badge className={`${flavorConfig.color} text-[10px] font-medium`}>
            {flavorConfig.label}
          </Badge>
        )}
      </div>
    </div>
  );
};
