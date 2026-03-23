import { SENSORY_METRICS } from "@/config/trial.config";
import type { AnalysisLog } from "@/types/trial";

export const isLogComplete = (log: AnalysisLog): boolean => {
  const hasCompleteEval =
    log.evaluations.length > 0 &&
    log.evaluations.some((ev) =>
      SENSORY_METRICS.every(
        (m) => ev.metrics[m.key] != null && (ev.metrics[m.key] ?? 0) >= 1,
      ),
    );
  const hasPhoto = (log.photos?.length ?? 0) > 0;
  return hasCompleteEval && hasPhoto;
};
