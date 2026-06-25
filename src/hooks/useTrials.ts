import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { TrialSetup, ProcessStep, PhysicalMeasurements, FoulingResult, TrialVisibility } from "@/types/trial";
import type { AnalysisLogInput, SensoryEvaluationInput } from "@/api/trials";
import * as api from "@/api/trials";
import { useAuth } from "@/contexts/AuthContext";

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
  const { role } = useAuth();
  return useMutation({
    mutationFn: ({
      setup,
      name,
      visibility,
    }: {
      setup: TrialSetup;
      name?: string;
      visibility?: TrialVisibility;
    }) =>
      // Only owners may create private trials. Any other role (including a
      // not-signed-in guest) is forced to public, regardless of what the
      // caller requested.
      api.createTrialWithSetup(
        setup,
        name,
        role === "owner" ? visibility : "public",
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: trialKeys.all }),
  });
};

export const useUpdateTrialSetup = (trialId: string) => {
  const qc = useQueryClient();
  const { role } = useAuth();
  return useMutation({
    mutationFn: ({
      setup,
      visibility,
    }: {
      setup: TrialSetup;
      visibility?: TrialVisibility;
    }) =>
      // Non-owners can never change visibility (undefined = leave unchanged).
      api.updateTrialSetup(
        trialId,
        setup,
        role === "owner" ? visibility : undefined,
      ),
    onSuccess: (updated) => {
      qc.setQueryData(trialKeys.detail(trialId), updated);
      qc.invalidateQueries({ queryKey: trialKeys.all });
    },
  });
};

export const useUpsertProcessSteps = (trialId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (steps: ProcessStep[]) => api.upsertProcessSteps(trialId, steps),
    onSuccess: (updated) => {
      qc.setQueryData(trialKeys.detail(trialId), updated);
      qc.invalidateQueries({ queryKey: trialKeys.all });
    },
  });
};

export const useUpsertFouling = (trialId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (fouling: FoulingResult | undefined) => api.upsertFouling(trialId, fouling),
    onSuccess: (updated) => {
      qc.setQueryData(trialKeys.detail(trialId), updated);
      qc.invalidateQueries({ queryKey: trialKeys.all });
    },
  });
};

export const useUpsertMeasurements = (trialId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ logId, measurements }: { logId: string; measurements: PhysicalMeasurements }) =>
      api.upsertMeasurements(trialId, logId, measurements),
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

export const useAddEvaluation = (trialId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ logId, input }: { logId: string; input: SensoryEvaluationInput }) =>
      api.addEvaluation(trialId, logId, input),
    onSuccess: (updated) => {
      qc.setQueryData(trialKeys.detail(trialId), updated);
      qc.invalidateQueries({ queryKey: trialKeys.all });
    },
  });
};

export const useUpdateEvaluation = (trialId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      logId,
      evalId,
      input,
    }: {
      logId: string;
      evalId: string;
      input: Partial<SensoryEvaluationInput>;
    }) => api.updateEvaluation(trialId, logId, evalId, input),
    onSuccess: (updated) => {
      qc.setQueryData(trialKeys.detail(trialId), updated);
      qc.invalidateQueries({ queryKey: trialKeys.all });
    },
  });
};

export const useDeleteEvaluation = (trialId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ logId, evalId }: { logId: string; evalId: string }) =>
      api.deleteEvaluation(trialId, logId, evalId),
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


export interface ProcessRecordSuggestions {
  stepNames: string[];
  paramKeys: string[];
  getParamValues: (key: string) => string[];
  getParamUnits: (key: string) => string[];
}

export const useProcessRecordSuggestions = (): ProcessRecordSuggestions => {
  const { data: trials = [] } = useTrials();
  return useMemo(() => {
    const stepNames = new Set<string>();
    const paramKeys = new Set<string>();
    const valuesByKey = new Map<string, Set<string>>();
    const unitsByKey = new Map<string, Set<string>>();

    for (const trial of trials) {
      for (const step of trial.processSteps) {
        if (step.name.trim()) stepNames.add(step.name.trim());
        for (const param of step.params) {
          const key = param.key.trim();
          if (!key) continue;
          paramKeys.add(key);
          if (!valuesByKey.has(key)) valuesByKey.set(key, new Set());
          if (!unitsByKey.has(key)) unitsByKey.set(key, new Set());
          if (param.value.trim()) valuesByKey.get(key)!.add(param.value.trim());
          if (param.unit?.trim()) unitsByKey.get(key)!.add(param.unit.trim());
        }
      }
    }

    return {
      stepNames: [...stepNames].sort(),
      paramKeys: [...paramKeys].sort(),
      getParamValues: (key: string) => [...(valuesByKey.get(key) ?? [])].sort(),
      getParamUnits: (key: string) => [...(unitsByKey.get(key) ?? [])].sort(),
    };
  }, [trials]);
};

export const useAllThermalProcessingTypeSuggestions = (): string[] => {
  const { data: trials } = useTrials();
  return useMemo(() => {
    if (!trials) return [];
    const seen = new Set<string>();
    for (const trial of trials) {
      const thermal = trial.setup?.thermalProcessingType;
      if (thermal?.trim()) seen.add(thermal.trim());
    }
    return [...seen].sort((a, b) => a.localeCompare(b));
  }, [trials]);
};

export const useAllStorageTimeSuggestions = (): number[] => {
  const { data: trials } = useTrials();
  return useMemo(() => {
    if (!trials) return [];
    const seen = new Set<number>();
    for (const trial of trials) {
      for (const log of trial.analysisLogs) {
        seen.add(log.storageTimeMinutes);
      }
    }
    return [...seen].sort((a, b) => a - b);
  }, [trials]);
};
