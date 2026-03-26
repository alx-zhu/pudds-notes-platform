import { useCallback, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { TrialIngredient } from "@/types/ingredient";
import type {
  AddTrialIngredientInput,
  UpdateTrialIngredientInput,
} from "@/api/trialIngredients";
import * as api from "@/api/trialIngredients";
import { trialKeys } from "./useTrials";
import { ingredientKeys } from "./useIngredients";

/* ── Individual mutations (standard REST) ────────────────────────── */

export const useAddTrialIngredient = (trialId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AddTrialIngredientInput) =>
      api.addTrialIngredient(trialId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: trialKeys.detail(trialId) });
      qc.invalidateQueries({ queryKey: trialKeys.all });
    },
  });
};

export const useUpdateTrialIngredient = (trialId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      ingredientId,
      input,
    }: {
      ingredientId: string;
      input: UpdateTrialIngredientInput;
    }) => api.updateTrialIngredient(trialId, ingredientId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: trialKeys.detail(trialId) });
      qc.invalidateQueries({ queryKey: trialKeys.all });
    },
  });
};

export const useRemoveTrialIngredient = (trialId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ingredientId: string) =>
      api.removeTrialIngredient(trialId, ingredientId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: trialKeys.detail(trialId) });
      qc.invalidateQueries({ queryKey: trialKeys.all });
    },
  });
};

/* ── Orchestration hook for modal save ───────────────────────────── */

interface EditedIngredient {
  ingredientId: string;
  percentage: number;
  pinned?: boolean;
}

/**
 * Computes a diff between original and edited ingredient lists,
 * then calls API functions directly and invalidates once at the end.
 *
 * Usage: const { save, isPending } = useSaveTrialIngredients(trialId);
 *        save(originalList, editedList, { onSuccess: () => closeModal() });
 */
export const useSaveTrialIngredients = (trialId: string) => {
  const qc = useQueryClient();
  const [isPending, setIsPending] = useState(false);

  const save = useCallback(
    async (
      original: TrialIngredient[],
      edited: EditedIngredient[],
      options?: { onSuccess?: () => void },
    ) => {
      const originalMap = new Map(
        original.map((ti) => [ti.ingredient.id, ti]),
      );
      const editedMap = new Map(edited.map((e) => [e.ingredientId, e]));

      const removals = original.filter(
        (ti) => !editedMap.has(ti.ingredient.id),
      );
      const additions = edited.filter(
        (e) => !originalMap.has(e.ingredientId),
      );
      const updates = edited.filter((e) => {
        const orig = originalMap.get(e.ingredientId);
        if (!orig) return false;
        return (
          orig.percentage !== e.percentage || orig.pinned !== e.pinned
        );
      });

      setIsPending(true);
      try {
        // Call API functions directly to avoid per-mutation invalidation
        await Promise.all([
          ...removals.map((r) =>
            api.removeTrialIngredient(trialId, r.ingredient.id),
          ),
          ...additions.map((a) =>
            api.addTrialIngredient(trialId, {
              ingredientId: a.ingredientId,
              percentage: a.percentage,
              pinned: a.pinned,
            }),
          ),
          ...updates.map((u) =>
            api.updateTrialIngredient(trialId, u.ingredientId, {
              percentage: u.percentage,
              pinned: u.pinned,
            }),
          ),
        ]);

        // Invalidate once after all operations complete
        await Promise.all([
          qc.invalidateQueries({ queryKey: trialKeys.detail(trialId) }),
          qc.invalidateQueries({ queryKey: trialKeys.all }),
          qc.invalidateQueries({ queryKey: ingredientKeys.all }),
        ]);

        options?.onSuccess?.();
      } finally {
        setIsPending(false);
      }
    },
    [trialId, qc],
  );

  return { save, isPending };
};
