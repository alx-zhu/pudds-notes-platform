import { getForm } from "@/config/sensoryForms";
import type { ProcessingType } from "@/config/trial.config";
import type { AnalysisLog } from "@/types/trial";

export const isLogComplete = (log: AnalysisLog, processingType?: ProcessingType): boolean => {
  const form = getForm(processingType);
  const hasCompleteEval =
    log.evaluations.length > 0 &&
    log.evaluations.some((ev) =>
      form.every((key) => ev.metrics[key] != null && (ev.metrics[key] ?? 0) >= 1),
    );
  const hasPhoto = (log.photos?.length ?? 0) > 0;
  return hasCompleteEval && hasPhoto;
};
