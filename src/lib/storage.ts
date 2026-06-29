import { supabase } from "@/lib/supabase";

const BUCKET = "trial-media";
export const MAX_MEDIA_BYTES = 50 * 1024 * 1024;

export type MediaType = "image" | "video";
export interface UploadedMedia {
  path: string;
  type: MediaType;
}

/**
 * Validate a picked media file. Returns an error message, or null if valid.
 * Single source of truth for the type/size rules enforced on upload.
 */
export const validateMediaFile = (file: File): string | null => {
  if (!/^(image|video)\//.test(file.type))
    return "Only images and videos are supported.";
  if (file.size > MAX_MEDIA_BYTES) return "That file is over 50 MB.";
  return null;
};

export const uploadTrialMedia = async (
  file: File,
  trialId: string,
): Promise<UploadedMedia> => {
  const invalid = validateMediaFile(file);
  if (invalid) throw new Error(invalid);
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

/**
 * Resolve a stored photo value to a renderable URL. Back-compat for the photo
 * migration: legacy base64 data-URLs render as-is; storage paths resolve to a
 * public URL.
 */
export const resolveMediaSrc = (value: string): string =>
  value.startsWith("data:") ? value : getMediaUrl(value);

/**
 * Infer whether a stored media value is a video, from its data-URL prefix or
 * file extension. Analysis-log media keeps images and videos in one `photos`
 * array, so the renderer branches on this rather than a stored type.
 */
export const isVideoSrc = (value: string): boolean =>
  // Legacy base64 (`data:`) photos are image-only; only storage paths can be
  // video, so a non-`data:` value with a video extension is the only case.
  !value.startsWith("data:") && /\.(mp4|webm|mov|m4v)$/i.test(value);

// CLEANUP(migration-002, 2026-06-28): only used by migration 002 — remove with it.
/**
 * Upload to a caller-chosen path (used by the photo migration for deterministic,
 * convergent keys). Steady-state uploads use `uploadTrialMedia`.
 */
export const uploadAtPath = async (
  path: string,
  file: File,
  opts?: { upsert?: boolean },
): Promise<void> => {
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: opts?.upsert ?? false,
  });
  if (error) throw error;
};

export const deleteTrialMedia = async (paths: string[]): Promise<void> => {
  if (!paths.length) return;
  const { error } = await supabase.storage.from(BUCKET).remove(paths);
  if (error) throw error;
};
