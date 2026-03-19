import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { TrialSetup } from "@/types/trial";
import type { AnalysisLogInput } from "@/api/trials";
import type {
  ProcessingType,
  Flavor,
  ThermalProcessingType,
  StorageTime,
  SensoryMetricKey,
} from "@/config/trial.config";
import { SENSORY_METRICS } from "@/config/trial.config";
import * as api from "@/api/trials";

export const trialKeys = {
  all: ["trials"] as const,
  detail: (id: string) => ["trials", id] as const,
};

export const useTrials = () =>
  useQuery({ queryKey: trialKeys.all, queryFn: api.fetchTrials });

export const useTrial = (id: string) =>
  useQuery({
    queryKey: trialKeys.detail(id),
    queryFn: () => api.fetchTrial(id),
    enabled: Boolean(id),
  });

export const useCreateTrial = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createTrial,
    onSuccess: () => qc.invalidateQueries({ queryKey: trialKeys.all }),
  });
};

export const useCreateTrialWithSetup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ setup, name }: { setup: TrialSetup; name?: string }) =>
      api.createTrialWithSetup(setup, name),
    onSuccess: () => qc.invalidateQueries({ queryKey: trialKeys.all }),
  });
};

export const useUpdateTrialSetup = (trialId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (setup: TrialSetup) => api.updateTrialSetup(trialId, setup),
    onSuccess: (updated) => {
      qc.setQueryData(trialKeys.detail(trialId), updated);
      qc.invalidateQueries({ queryKey: trialKeys.all });
    },
  });
};

export const useAddAnalysisLog = (trialId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AnalysisLogInput) => api.addAnalysisLog(trialId, input),
    onSuccess: (updated) => {
      qc.setQueryData(trialKeys.detail(trialId), updated);
      qc.invalidateQueries({ queryKey: trialKeys.all });
    },
  });
};

export const useUpdateAnalysisLog = (trialId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      logId,
      input,
    }: {
      logId: string;
      input: Partial<AnalysisLogInput>;
    }) => api.updateAnalysisLog(trialId, logId, input),
    onSuccess: (updated) => {
      qc.setQueryData(trialKeys.detail(trialId), updated);
      qc.invalidateQueries({ queryKey: trialKeys.all });
    },
  });
};

export const useDeleteAnalysisLog = (trialId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (logId: string) => api.deleteAnalysisLog(trialId, logId),
    onSuccess: (updated) => {
      qc.setQueryData(trialKeys.detail(trialId), updated);
      qc.invalidateQueries({ queryKey: trialKeys.all });
    },
  });
};

export const useUpdateTrialName = (trialId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string | undefined) =>
      api.updateTrialName(trialId, name),
    onSuccess: (updated) => {
      qc.setQueryData(trialKeys.detail(trialId), updated);
      qc.invalidateQueries({ queryKey: trialKeys.all });
    },
  });
};

export const useDeleteTrial = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteTrial,
    onSuccess: () => qc.invalidateQueries({ queryKey: trialKeys.all }),
  });
};

export const useAllIngredientSuggestions = (): string[] => {
  const { data: trials } = useTrials();
  return useMemo(() => {
    if (!trials) return [];
    const seen = new Set<string>();
    for (const trial of trials) {
      for (const v of trial.setup?.variables ?? []) {
        if (v.ingredient.trim()) seen.add(v.ingredient.trim());
      }
    }
    return [...seen].sort((a, b) => a.localeCompare(b));
  }, [trials]);
};

/**
 * Returns averaged sensory metrics from logs across other trials that share the
 * exact same setup type (processingType + flavor) AND log type
 * (thermalProcessingType + storageTime).
 *
 * This hook establishes the query contract for cross-trial comparison.
 * When migrating to Postgres, replace the internals with a dedicated
 * API endpoint — the signature and return type stay the same.
 */
export interface SensoryComparisonParams {
  excludeTrialId: string;
  processingType?: ProcessingType;
  flavor?: Flavor;
  thermalProcessingType: ThermalProcessingType;
  storageTime: StorageTime;
}

export interface SensoryComparisonResult {
  /** Averaged metric values from matching logs (0 when no data) */
  averages: Record<SensoryMetricKey, number>;
  /** How many matching logs contributed to the averages */
  logCount: number;
}

export const useSensoryComparison = (
  params: SensoryComparisonParams,
): SensoryComparisonResult => {
  const { data: allTrials = [] } = useTrials();

  return useMemo(() => {
    const matchingLogs = allTrials
      .filter(
        (t) =>
          t.id !== params.excludeTrialId &&
          t.setup?.processingType === params.processingType &&
          t.setup?.flavor === params.flavor,
      )
      .flatMap((t) => t.analysisLogs)
      .filter(
        (log) =>
          log.thermalProcessingType === params.thermalProcessingType &&
          log.storageTime === params.storageTime,
      );

    const averages = {} as Record<SensoryMetricKey, number>;
    for (const metric of SENSORY_METRICS) {
      const vals = matchingLogs
        .map((log) => log.metrics[metric.key])
        .filter((v): v is number => v != null && v >= 1);
      averages[metric.key] =
        vals.length > 0
          ? Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 10) /
            10
          : 0;
    }

    return { averages, logCount: matchingLogs.length };
  }, [
    allTrials,
    params.excludeTrialId,
    params.processingType,
    params.flavor,
    params.thermalProcessingType,
    params.storageTime,
  ]);
};
