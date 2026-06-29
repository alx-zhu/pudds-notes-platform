import { useEffect, useRef, useState } from "react";
import { useUploadMedia } from "@/hooks/useTrialMedia";
import { validateMediaFile } from "@/lib/storage";
import type { MediaRef, MediaType } from "@/types/media";

/** Already-persisted media (has a storage path) vs. a pending in-memory pick. */
export type DraftItem =
  | { kind: "saved"; media: MediaRef }
  | { kind: "pending"; id: string; file: File; url: string; type: MediaType };

const draftItemId = (it: DraftItem): string =>
  it.kind === "pending" ? it.id : it.media.id;

export interface CommitResult {
  /** Final media[] in display order, pending picks swapped for uploads. */
  media: MediaRef[];
  /** Paths present in the initial media but no longer referenced. */
  removedPaths: string[];
}

/**
 * Owns the saved/pending draft model behind a media editor: object-URL
 * lifecycle, file validation, and the upload→reconcile in `commitUploads`.
 * Data-agnostic — the caller persists the returned `media` (its own mutation)
 * and then deletes `removedPaths`, keeping persist-then-delete ordering so a
 * failed save never orphans a still-referenced object.
 */
export const useMediaDraft = (initialMedia: MediaRef[], trialId: string) => {
  const [items, setItems] = useState<DraftItem[]>(() =>
    initialMedia.map((media) => ({ kind: "saved", media })),
  );
  const [error, setError] = useState<string | null>(null);
  const uploadMedia = useUploadMedia(trialId);

  // Revoke any object URLs still held by pending picks on unmount.
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  });
  useEffect(
    () => () => {
      itemsRef.current.forEach((it) => {
        if (it.kind === "pending") URL.revokeObjectURL(it.url);
      });
    },
    [],
  );

  const addFiles = (files: FileList) => {
    const next: DraftItem[] = [];
    for (const file of Array.from(files)) {
      const invalid = validateMediaFile(file);
      if (invalid) {
        setError(invalid);
        continue;
      }
      next.push({
        kind: "pending",
        id: crypto.randomUUID(),
        file,
        url: URL.createObjectURL(file),
        type: file.type.startsWith("video") ? "video" : "image",
      });
    }
    if (next.length) {
      setError(null);
      setItems((prev) => [...prev, ...next]);
    }
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((it) => draftItemId(it) === id);
      if (target?.kind === "pending") URL.revokeObjectURL(target.url);
      return prev.filter((it) => draftItemId(it) !== id);
    });
  };

  /**
   * Upload pending picks, then reassemble media[] in display order. Throws if
   * the upload fails (caller surfaces the message and aborts before persisting).
   */
  const commitUploads = async (): Promise<CommitResult> => {
    const pending = items.filter(
      (it): it is Extract<DraftItem, { kind: "pending" }> =>
        it.kind === "pending",
    );

    const uploaded = await uploadMedia.mutateAsync(pending.map((p) => p.file));

    // Reassemble media[] in display order, swapping pending picks for uploads.
    const queue = [...uploaded];
    const media: MediaRef[] = items.map((it) => {
      if (it.kind === "saved") return it.media;
      const up = queue.shift()!;
      return { id: it.id, path: up.path, type: up.type };
    });

    const savedPaths = new Set(media.map((m) => m.path));
    const removedPaths = initialMedia
      .map((m) => m.path)
      .filter((p) => !savedPaths.has(p));

    return { media, removedPaths };
  };

  return {
    items,
    error,
    setError,
    addFiles,
    removeItem,
    commitUploads,
    isUploading: uploadMedia.isPending,
  };
};
