import { useMutation } from "@tanstack/react-query";
import {
  uploadTrialMedia,
  deleteTrialMedia,
  type UploadedMedia,
} from "@/lib/storage";

export const useUploadMedia = (trialId: string) =>
  useMutation<UploadedMedia[], Error, File[]>({
    mutationFn: (files) =>
      Promise.all(files.map((f) => uploadTrialMedia(f, trialId))),
  });

export const useDeleteMedia = () =>
  useMutation<void, Error, string[]>({
    mutationFn: (paths) => deleteTrialMedia(paths),
  });
