/**
 * Migration 002 — move legacy base64 AnalysisLog photos to `trial-media` Storage
 *
 * Background: photos were originally stored as base64 JPEG data-URLs inline in
 * `AnalysisLog.photos`, which bloats the synced snapshot blob. This migration
 * uploads each legacy photo to the `trial-media` bucket and replaces it with a
 * storage path. Display back-compat lives in `resolveMediaSrc`.
 *
 * Differs from the synchronous, flag-gated migrations (001) by necessity:
 *  - async (uploads), so it runs after the app mounts, not in main.tsx;
 *  - owner-only — only owners can write Storage and publish;
 *  - NO version flag — a flag set while there's no base64 would miss base64
 *    pulled in by a later Sync. Instead it's a cheap idempotent scan (fast
 *    no-op when there's no `data:`), run on owner load and after each owner Sync;
 *  - deterministic, slot-based keys so multiple owners converge to one object
 *    instead of uploading duplicates;
 *  - does NOT publish — the owner's next Save propagates the slimmer blob.
 *
 * Cleanup: once all clients' snapshots are free of base64, delete this file and
 * everything tagged `CLEANUP(migration-002` — grep for that tag. It marks the
 * two call-sites (`useMigration002()` in `AppShell`, `runMigration002()` in
 * `usePullSnapshot`) plus two helpers used only here: `uploadAtPath`
 * (lib/storage.ts) and `dataUrlToFile` (lib/image.ts).
 */
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { uploadAtPath } from "@/lib/storage";
import { dataUrlToFile } from "@/lib/image";
import { useAuth } from "@/contexts/AuthContext";

const TRIALS_KEY = "pudds:trials";

interface MigLog {
  id: string;
  photos?: string[];
}
interface MigTrial {
  id: string;
  analysisLogs?: MigLog[];
}

/**
 * Convert legacy base64 photos in localStorage to `trial-media` storage paths.
 * Cheap + idempotent: fast no-op when there's no base64, skips already-migrated
 * entries, never drops a photo on failure (retried on a later run).
 *
 * @returns true if any photo was migrated (caller should refresh the UI).
 */
interface Replacement {
  trialId: string;
  logId: string;
  index: number;
  from: string; // the exact base64 value uploaded
  to: string; // the storage path it became
}

export const runMigration002 = async (): Promise<boolean> => {
  const raw = localStorage.getItem(TRIALS_KEY);
  // Fast no-op: skip the JSON parse entirely when there's no inline base64.
  if (!raw || !raw.includes("data:")) return false;

  let trials: MigTrial[];
  try {
    trials = JSON.parse(raw) as MigTrial[];
  } catch {
    return false;
  }

  // Upload first, collecting replacements. We do NOT mutate+write this parsed
  // copy: uploads are async (seconds), and a concurrent trial edit would be
  // clobbered if we wrote a stale snapshot back. Replacements are applied to a
  // fresh read below, only where the value is still the base64 we uploaded.
  const replacements: Replacement[] = [];
  for (const trial of trials) {
    for (const log of trial.analysisLogs ?? []) {
      const photos = log.photos;
      if (!Array.isArray(photos)) continue;
      for (let i = 0; i < photos.length; i++) {
        const value = photos[i];
        if (typeof value !== "string" || !value.startsWith("data:")) continue;
        // Deterministic, slot-based key → concurrent owners converge to one object.
        const path = `${trial.id}/${log.id}-${i}.jpg`;
        try {
          const file = dataUrlToFile(value, `${log.id}-${i}.jpg`);
          await uploadAtPath(path, file, { upsert: true });
          replacements.push({
            trialId: trial.id,
            logId: log.id,
            index: i,
            from: value,
            to: path,
          });
        } catch {
          // Leave this one as base64; a later run retries. Never drop a photo.
        }
      }
    }
  }

  if (!replacements.length) return false;

  // Re-read current localStorage and apply each replacement only if that slot
  // still holds the exact base64 we uploaded — so any edit made during the
  // upload window survives.
  const freshRaw = localStorage.getItem(TRIALS_KEY);
  if (!freshRaw) return false;
  let fresh: MigTrial[];
  try {
    fresh = JSON.parse(freshRaw) as MigTrial[];
  } catch {
    return false;
  }

  let changed = false;
  for (const r of replacements) {
    const photos = fresh
      .find((t) => t.id === r.trialId)
      ?.analysisLogs?.find((l) => l.id === r.logId)?.photos;
    if (Array.isArray(photos) && photos[r.index] === r.from) {
      photos[r.index] = r.to;
      changed = true;
    }
  }

  if (changed) localStorage.setItem(TRIALS_KEY, JSON.stringify(fresh));
  return changed;
};

/**
 * Owner-only on-load trigger for migration 002. The after-Sync trigger lives in
 * `usePullSnapshot` (a pulled snapshot can carry fresh base64).
 */
export const useMigration002 = (): void => {
  const { role } = useAuth();
  const qc = useQueryClient();
  const ran = useRef(false);

  useEffect(() => {
    if (role !== "owner" || ran.current) return;
    ran.current = true;
    void runMigration002().then((changed) => {
      if (changed) qc.invalidateQueries();
    });
  }, [role, qc]);
};
