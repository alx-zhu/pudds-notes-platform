import { supabase } from "@/lib/supabase";

const BUCKET = "trial-media";
const MAX_BYTES = 50 * 1024 * 1024;

export type MediaType = "image" | "video";
export interface UploadedMedia {
  path: string;
  type: MediaType;
}

export const uploadTrialMedia = async (
  file: File,
  trialId: string,
): Promise<UploadedMedia> => {
  if (!/^(image|video)\//.test(file.type))
    throw new Error("Only images and videos are supported.");
  if (file.size > MAX_BYTES) throw new Error("That file is over 50 MB.");
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const path = `${trialId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  return { path, type: file.type.startsWith("video") ? "video" : "image" };
};

export const getMediaUrl = (path: string): string =>
  supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;

export const deleteTrialMedia = async (paths: string[]): Promise<void> => {
  if (!paths.length) return;
  const { error } = await supabase.storage.from(BUCKET).remove(paths);
  if (error) throw error;
};
