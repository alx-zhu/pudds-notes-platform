import { useState, useEffect } from "react";
import {
  LayoutGrid,
  TestTubes,
  Cloud,
  Save,
  RotateCcw,
  Loader2,
  LogOut,
  Lock,
  RefreshCw,
} from "lucide-react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useReadOnly } from "@/contexts/ReadOnlyContext";
import { usePublishSnapshot, usePullSnapshot, useLatestSnapshot } from "@/hooks/useSnapshot";

/* ── Sidebar icon ───────────────────────────────────────────────── */

const SidebarIcon = ({
  icon,
  active,
  onClick,
  title,
}: {
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  title?: string;
}) => (
  <Button
    variant={active ? "default" : "ghost"}
    size="icon"
    className={cn(
      "rounded-xl w-10 h-10 cursor-pointer",
      !active && "text-muted-foreground",
    )}
    onClick={onClick}
    title={title}
  >
    {icon}
  </Button>
);

/* ── Read-only banner ───────────────────────────────────────────── */

const ReadOnlyBanner = () => {
  const pullMutation = usePullSnapshot();
  const latestSnapshot = useLatestSnapshot();
  const lastSync = localStorage.getItem("pudds:last-sync");

  const fmt = (iso: string) =>
    new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));

  const hasNewerVersion =
    latestSnapshot.data && lastSync
      ? new Date(latestSnapshot.data.created_at) > new Date(lastSync)
      : latestSnapshot.data && !lastSync;

  const statusText = pullMutation.isError
    ? <span className="text-xs text-destructive">Sync failed</span>
    : hasNewerVersion
    ? <span className="text-xs text-amber-600 font-medium">New version available</span>
    : lastSync
    ? <span className="text-xs text-muted-foreground">Synced {fmt(lastSync)}</span>
    : null;

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-card border-b border-border text-sm text-muted-foreground shrink-0">
      <Lock size={12} className="shrink-0" />
      <span className="font-medium text-foreground/70">Read-only</span>
      <div className="ml-auto flex items-center gap-1.5">
        {statusText}
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs gap-1.5"
          onClick={() => pullMutation.mutate()}
          disabled={pullMutation.isPending}
        >
          {pullMutation.isPending ? (
            <Loader2 size={11} className="animate-spin" />
          ) : (
            <RefreshCw size={11} />
          )}
          Sync
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-xs gap-1.5 text-muted-foreground"
          onClick={() => supabase.auth.signOut()}
        >
          <LogOut size={11} />
          Sign out
        </Button>
      </div>
    </div>
  );
};

/* ── Sync modal (owner only) ────────────────────────────────────── */

const SyncModal = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { session } = useAuth();
  const qc = useQueryClient();
  const pushMutation = usePublishSnapshot();
  const pullMutation = usePullSnapshot();
  const latestSnapshot = useLatestSnapshot();
  const [eraseConfirm, setEraseConfirm] = useState(false);

  const lastSaved = latestSnapshot.data?.created_at
    ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(
        new Date(latestSnapshot.data.created_at),
      )
    : null;

  // Close after successful pull — only updates parent state, no local setState
  useEffect(() => {
    if (pullMutation.isSuccess) onOpenChange(false);
  }, [pullMutation.isSuccess, onOpenChange]);

  // Auto-clear push success (async, not synchronous setState)
  useEffect(() => {
    if (!pushMutation.isSuccess) return;
    const t = setTimeout(() => pushMutation.reset(), 2000);
    return () => clearTimeout(t);
  }, [pushMutation.isSuccess, pushMutation]);

  const handleErase = () => {
    localStorage.removeItem("pudds:trials");
    localStorage.removeItem("pudds:ingredients");
    localStorage.removeItem("pudds:trial-ingredients");
    qc.invalidateQueries();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-5 py-4 border-b">
          <DialogTitle className="text-sm font-semibold">Cloud backup</DialogTitle>
        </DialogHeader>

        {/* Cloud actions */}
        <div className="px-5 py-4 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium">Save to cloud</p>
              <p className="text-xs text-muted-foreground">
                {lastSaved ? `Last saved: ${lastSaved}` : "Saves a copy of your data to the cloud"}
              </p>
              {pushMutation.isError && (
                <p className="text-xs text-destructive mt-0.5">
                  {pushMutation.error.message}
                </p>
              )}
              {pushMutation.isSuccess && (
                <p className="text-xs text-green-600 mt-0.5">Saved ✓</p>
              )}
            </div>
            <Button
              size="sm"
              variant="outline"
              className="shrink-0 gap-1.5"
              onClick={() => pushMutation.mutate()}
              disabled={pushMutation.isPending}
            >
              {pushMutation.isPending ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Save size={13} />
              )}
              Save
            </Button>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium">Restore latest version</p>
              <p className="text-xs text-muted-foreground">
                Replaces local data with the last saved version
              </p>
              {pullMutation.isError && (
                <p className="text-xs text-destructive mt-0.5">
                  {pullMutation.error.message}
                </p>
              )}
            </div>
            <Button
              size="sm"
              variant="outline"
              className="shrink-0 gap-1.5"
              onClick={() => pullMutation.mutate()}
              disabled={pullMutation.isPending}
            >
              {pullMutation.isPending ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <RotateCcw size={13} />
              )}
              Restore
            </Button>
          </div>
        </div>

        <Separator />

        {/* Account + danger */}
        <div className="px-5 py-4 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium">Erase local data</p>
              <p className="text-xs text-muted-foreground">
                Clears all trials and ingredients
              </p>
            </div>
            {eraseConfirm ? (
              <div className="flex gap-1.5 shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEraseConfirm(false)}
                >
                  Cancel
                </Button>
                <Button size="sm" variant="destructive" onClick={handleErase}>
                  Erase
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setEraseConfirm(true)}
              >
                Erase
              </Button>
            )}
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground truncate min-w-0">
              {session?.user.email}
            </p>
            <Button
              size="sm"
              variant="ghost"
              className="shrink-0 gap-1.5 text-muted-foreground"
              onClick={() => supabase.auth.signOut()}
            >
              <LogOut size={13} />
              Sign out
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/* ── AppShell ───────────────────────────────────────────────────── */

export const AppShell = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isReadOnly = useReadOnly();
  const isTrials = location.pathname.startsWith("/trials");
  const isIngredients = location.pathname === "/ingredients";
  const [syncOpen, setSyncOpen] = useState(false);
  const saveMutation = usePublishSnapshot();

  return (
    <div className="flex h-screen overflow-hidden bg-muted/60">
      <aside className="w-16 bg-card border-r border-border flex flex-col items-center py-4 gap-2 shrink-0">
        <SidebarIcon
          icon={<LayoutGrid size={18} />}
          active={isTrials}
          onClick={() => navigate("/trials")}
          title="Trials"
        />
        <SidebarIcon
          icon={<TestTubes size={18} />}
          active={isIngredients}
          onClick={() => navigate("/ingredients")}
          title="Ingredients"
        />
        {!isReadOnly && (
          <div className="mt-auto flex flex-col gap-2">
            <SidebarIcon
              icon={
                saveMutation.isPending ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Save size={18} />
                )
              }
              onClick={() => saveMutation.mutate()}
              title="Save to cloud"
            />
            <SidebarIcon
              icon={<Cloud size={18} />}
              onClick={() => setSyncOpen(true)}
              title="Cloud backup"
            />
          </div>
        )}
      </aside>

      <div className="flex flex-col flex-1 overflow-hidden">
        {isReadOnly && <ReadOnlyBanner />}
        <Outlet />
      </div>

      <SyncModal
        key={String(syncOpen)}
        open={syncOpen}
        onOpenChange={setSyncOpen}
      />
    </div>
  );
};
