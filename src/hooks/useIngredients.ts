import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "@/api/ingredients";
import { trialKeys } from "./useTrials";

export const ingredientKeys = {
  all: ["ingredients"] as const,
};

export const useIngredients = () =>
  useQuery({ queryKey: ingredientKeys.all, queryFn: api.fetchIngredients });

export const useCreateIngredient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => api.createIngredient(name),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ingredientKeys.all });
    },
  });
};

export const useUpdateIngredient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      api.updateIngredient(id, name),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ingredientKeys.all });
      // Resolved ingredient names may have changed on trials
      qc.invalidateQueries({ queryKey: trialKeys.all });
    },
  });
};

export const useDeleteIngredient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteIngredient(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ingredientKeys.all });
      // Trials referencing this ingredient will have stale resolved data
      qc.invalidateQueries({ queryKey: trialKeys.all });
    },
  });
};
