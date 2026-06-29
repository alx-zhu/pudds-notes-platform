import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  publishSnapshot,
  fetchLatestSnapshot,
  pullSnapshot,
  type SnapshotTier,
} from "@/api/snapshot";
// CLEANUP(migration-002, 2026-06-28): remove this import + the runMigration002() call once all clients are migrated.
import { runMigration002 } from "@/migrations/002-photos-to-storage";

export const usePublishSnapshot = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: publishSnapshot,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["snapshot", "latest"] }),
  });
};

export const useLatestSnapshot = (tier: SnapshotTier) =>
  useQuery({
    queryKey: ["snapshot", "latest", tier],
    queryFn: () => fetchLatestSnapshot(tier),
    retry: false,
  });

export const usePullSnapshot = (tier: SnapshotTier) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await pullSnapshot(tier);
      // CLEANUP(migration-002, 2026-06-28): temporary — remove this block once
      // all clients are migrated. See migrations/002-photos-to-storage.ts.
      // A pulled snapshot may carry legacy base64 photos; owners migrate them
      // (cheap no-op when there's none). Non-owners can't write, so skip.
      if (tier === "owner") await runMigration002();
    },
    onSuccess: () => qc.invalidateQueries(),
  });
};
