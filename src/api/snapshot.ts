import { supabase } from "@/lib/supabase";
import type { Trial } from "@/types/trial";
import { resolveForTrial } from "@/api/trialIngredients";
import { enrichTrialsForSnapshot, type EnrichedTrial } from "@/lib/enrichSnapshot";

export interface SnapshotPayload {
  trials: string;
  ingredients: string;
  trialIngredients: string;
}

export interface SnapshotRow {
  id: string;
  created_at: string;
  data: SnapshotPayload;
}

/**
 * Which snapshot tier a client reads. Owners read the full `owner` row;
 * everyone else reads the `public` row (private trials excluded).
 * Enforced by RLS — the tier here only selects the correct row to read.
 */
export type SnapshotTier = "owner" | "public";

export const publishSnapshot = async (): Promise<void> => {
  const rawTrials = localStorage.getItem("pudds:trials") ?? "[]";

  let enrichedTrials: EnrichedTrial[] = [];
  try {
    const parsed = JSON.parse(rawTrials) as Trial[];
    const resolvedTrials: Trial[] = parsed.map((trial) => ({
      ...trial,
      ingredients: resolveForTrial(trial.id),
    }));
    enrichedTrials = enrichTrialsForSnapshot(resolvedTrials);
  } catch {
    enrichedTrials = [];
  }

  const ingredients = localStorage.getItem("pudds:ingredients") ?? "[]";
  const rawTrialIngredients =
    localStorage.getItem("pudds:trial-ingredients") ?? "[]";

  // Public subset: drop private trials and their ingredient links so they
  // never reach the row non-owners are allowed to read.
  const publicTrials = enrichedTrials.filter((t) => t.visibility !== "private");
  const publicTrialIds = new Set(publicTrials.map((t) => t.id));
  let publicTrialIngredients = "[]";
  try {
    const links = JSON.parse(rawTrialIngredients) as { trialId: string }[];
    publicTrialIngredients = JSON.stringify(
      links.filter((l) => publicTrialIds.has(l.trialId)),
    );
  } catch {
    publicTrialIngredients = "[]";
  }

  const ownerPayload: SnapshotPayload = {
    trials: JSON.stringify(enrichedTrials),
    ingredients,
    trialIngredients: rawTrialIngredients,
  };
  const publicPayload: SnapshotPayload = {
    trials: JSON.stringify(publicTrials),
    ingredients,
    trialIngredients: publicTrialIngredients,
  };

  // Atomic insert: the owner and public rows always advance together.
  const { data, error } = await supabase
    .from("snapshots")
    .insert([
      { data: ownerPayload, visibility: "owner" },
      { data: publicPayload, visibility: "public" },
    ])
    .select("created_at");
  if (error) throw new Error(error.message);
  const createdAt = data?.[0]?.created_at;
  if (createdAt) localStorage.setItem("pudds:last-sync", createdAt);
};

export const fetchLatestSnapshot = async (
  tier: SnapshotTier,
): Promise<SnapshotRow> => {
  const { data, error } = await supabase
    .from("snapshots")
    .select("*")
    .eq("visibility", tier)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) throw new Error(error.message);
  return data as SnapshotRow;
};

export const pullSnapshot = async (tier: SnapshotTier): Promise<void> => {
  const row = await fetchLatestSnapshot(tier);
  localStorage.setItem("pudds:trials", row.data.trials);
  localStorage.setItem("pudds:ingredients", row.data.ingredients);
  localStorage.setItem("pudds:trial-ingredients", row.data.trialIngredients);
  localStorage.setItem("pudds:last-sync", row.created_at);
};
