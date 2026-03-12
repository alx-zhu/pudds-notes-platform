import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { TrialSetup, SensoryMetrics, PhotoGrid } from "@/types/trial";
import type { SensoryCategory } from "@/config/trial.config";
import * as api from "@/api/trials";

export const trialKeys = {
  all: ["trials"] as const,
  detail: (id: string) => ["trials", id] as const,
};

export function useTrials() {
  return useQuery({ queryKey: trialKeys.all, queryFn: api.fetchTrials });
}

export function useTrial(id: string) {
  return useQuery({
    queryKey: trialKeys.detail(id),
    queryFn: () => api.fetchTrial(id),
    enabled: Boolean(id),
  });
}

export function useCreateTrial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createTrial,
    onSuccess: () => qc.invalidateQueries({ queryKey: trialKeys.all }),
  });
}

export function useCreateTrialWithSetup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (setup: TrialSetup) => api.createTrialWithSetup(setup),
    onSuccess: () => qc.invalidateQueries({ queryKey: trialKeys.all }),
  });
}

export function useUpdateTrialSetup(trialId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (setup: TrialSetup) => api.updateTrialSetup(trialId, setup),
    onSuccess: (updated) => {
      qc.setQueryData(trialKeys.detail(trialId), updated);
      qc.invalidateQueries({ queryKey: trialKeys.all });
    },
  });
}

export function useUpdateSensoryCategory(trialId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      category,
      metrics,
    }: {
      category: SensoryCategory;
      metrics: SensoryMetrics;
    }) => api.updateSensoryCategory(trialId, category, metrics),
    onSuccess: (updated) => {
      qc.setQueryData(trialKeys.detail(trialId), updated);
      qc.invalidateQueries({ queryKey: trialKeys.all });
    },
  });
}

export function useUpdatePhotoGrid(trialId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (photos: PhotoGrid) => api.updatePhotoGrid(trialId, photos),
    onSuccess: (updated) => {
      qc.setQueryData(trialKeys.detail(trialId), updated);
      qc.invalidateQueries({ queryKey: trialKeys.all });
    },
  });
}

export function useUpdateTrialName(trialId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string | undefined) => api.updateTrialName(trialId, name),
    onSuccess: (updated) => {
      qc.setQueryData(trialKeys.detail(trialId), updated);
      qc.invalidateQueries({ queryKey: trialKeys.all });
    },
  });
}

export function useDeleteTrial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteTrial,
    onSuccess: () => qc.invalidateQueries({ queryKey: trialKeys.all }),
  });
}
