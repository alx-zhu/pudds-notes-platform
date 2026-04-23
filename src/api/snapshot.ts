import { supabase } from "@/lib/supabase";

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

export const publishSnapshot = async (): Promise<void> => {
  const payload: SnapshotPayload = {
    trials: localStorage.getItem("pudds:trials") ?? "[]",
    ingredients: localStorage.getItem("pudds:ingredients") ?? "[]",
    trialIngredients: localStorage.getItem("pudds:trial-ingredients") ?? "[]",
  };

  const { error } = await supabase.from("snapshots").insert({ data: payload });
  if (error) throw new Error(error.message);
};

export const fetchLatestSnapshot = async (): Promise<SnapshotRow> => {
  const { data, error } = await supabase
    .from("snapshots")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) throw new Error(error.message);
  return data as SnapshotRow;
};

export const pullSnapshot = async (): Promise<void> => {
  const row = await fetchLatestSnapshot();
  localStorage.setItem("pudds:trials", row.data.trials);
  localStorage.setItem("pudds:ingredients", row.data.ingredients);
  localStorage.setItem("pudds:trial-ingredients", row.data.trialIngredients);
  localStorage.setItem("pudds:last-sync", row.created_at);
};
