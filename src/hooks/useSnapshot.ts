import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  publishSnapshot,
  fetchLatestSnapshot,
  pullSnapshot,
  type SnapshotTier,
} from "@/api/snapshot";

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
    mutationFn: () => pullSnapshot(tier),
    onSuccess: () => qc.invalidateQueries(),
  });
};
