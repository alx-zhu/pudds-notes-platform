import type { MediaType } from "@/lib/storage";

export type { MediaType };

/**
 * A persisted media reference. Shared across features (observations, fouling,
 * …): a stable id, a `trial-media` storage `path`, and the media `type`. The
 * renderable URL is derived from `path` at display time (see `getMediaUrl`).
 */
export interface MediaRef {
  id: string;
  path: string;
  type: MediaType;
}
