import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  publishSnapshot,
  fetchLatestSnapshot,
  pullSnapshot,
} from "@/api/snapshot";

export const usePublishSnapshot = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: publishSnapshot,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["snapshot", "latest"] }),
  });
};

export const useLatestSnapshot = () =>
  useQuery({
    queryKey: ["snapshot", "latest"],
    queryFn: fetchLatestSnapshot,
    retry: false,
  });

export const usePullSnapshot = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: pullSnapshot,
    onSuccess: () => qc.invalidateQueries(),
  });
};
