import { useEffect } from "react";
import {
  LayoutGrid,
  TestTubes,
  Save,
  RotateCcw,
  Loader2,
  LogOut,
  Lock,
  RefreshCw,
  User,
  Pencil,
  Check,
  Trash2,
} from "lucide-react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import {
  usePublishSnapshot,
  usePullSnapshot,
  useLatestSnapshot,
} from "@/hooks/useSnapshot";

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

/* ── Role banner (all authenticated roles) ──────────────────────── */

const RoleBanner = () => {
  const { session, role } = useAuth();
  const qc = useQueryClient();
  const pushMutation = usePublishSnapshot();
  const pullMutation = usePullSnapshot();
  const latestSnapshot = useLatestSnapshot();
  const lastSync = localStorage.getItem("pudds:last-sync");

  useEffect(() => {
    if (!pushMutation.isSuccess) return;
    const t = setTimeout(() => pushMutation.reset(), 2000);
    return () => clearTimeout(t);
  }, [pushMutation.isSuccess, pushMutation]);

  const fmt = (iso: string) =>
    new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));

  const hasNewerVersion =
    latestSnapshot.data && lastSync
      ? new Date(latestSnapshot.data.created_at) > new Date(lastSync)
      : latestSnapshot.data && !lastSync;

  const statusText = pullMutation.isError ? (
    <span className="text-xs text-red-300">Sync failed</span>
  ) : hasNewerVersion ? (
    <span className="text-xs text-amber-300 font-medium">
      New version available
    </span>
  ) : lastSync ? (
    <span className="text-xs text-indigo-200/70">Synced {fmt(lastSync)}</span>
  ) : null;

  const handleErase = () => {
    localStorage.removeItem("pudds:trials");
    localStorage.removeItem("pudds:ingredients");
    localStorage.removeItem("pudds:trial-ingredients");
    qc.invalidateQueries();
  };

  const btn =
    "h-7 text-xs gap-1.5 bg-white/10 border-white/25 text-white hover:bg-white/20 hover:text-white";
  const ghost =
    "h-7 text-xs gap-1.5 text-white/70 hover:text-white hover:bg-white/10";

  const syncButton = (
    <Button
      size="sm"
      variant="outline"
      className={btn}
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
  );

  const signOutButton = (
    <Button
      size="sm"
      variant="ghost"
      className={ghost}
      onClick={() => supabase.auth.signOut()}
    >
      <LogOut size={11} />
      Sign out
    </Button>
  );

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-indigo-700 border-b border-indigo-900 text-sm shrink-0">
      {role === "viewer" && (
        <>
          <Lock size={12} className="shrink-0 text-white/80" />
          <span className="font-medium text-white">Read-only</span>
          <div className="ml-auto flex items-center gap-1.5">
            {statusText}
            {syncButton}
            {signOutButton}
          </div>
        </>
      )}
      {role === "editor" && (
        <>
          <Pencil size={12} className="shrink-0 text-white/80" />
          <span className="font-medium text-white">Editor</span>
          <div className="ml-auto flex items-center gap-1.5">
            {statusText}
            {syncButton}
            {signOutButton}
          </div>
        </>
      )}
      {role === "owner" && (
        <>
          <span className="text-xs text-indigo-200/70 truncate min-w-0">
            {session?.user.email}
          </span>
          <div className="ml-auto flex items-center gap-1.5">
            {statusText}
            {pushMutation.isError && (
              <span className="text-xs text-red-300">
                {pushMutation.error.message}
              </span>
            )}
            <Button
              size="sm"
              variant="outline"
              className={
                pushMutation.isSuccess
                  ? cn(
                      btn,
                      "bg-green-500/20 border-green-400/40 text-green-200 hover:bg-green-500/20 hover:text-green-200",
                    )
                  : btn
              }
              onClick={() => pushMutation.mutate()}
              disabled={pushMutation.isPending || pushMutation.isSuccess}
            >
              {pushMutation.isPending ? (
                <Loader2 size={11} className="animate-spin" />
              ) : pushMutation.isSuccess ? (
                <Check size={11} />
              ) : (
                <Save size={11} />
              )}
              {pushMutation.isSuccess ? "Saved" : "Save"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className={btn}
              onClick={() => pullMutation.mutate()}
              disabled={pullMutation.isPending}
            >
              {pullMutation.isPending ? (
                <Loader2 size={11} className="animate-spin" />
              ) : (
                <RotateCcw size={11} />
              )}
              Sync
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className={cn(
                    btn,
                    "bg-red-500/20 border-red-400/40 text-red-200 hover:bg-red-500/30 hover:text-red-200",
                  )}
                >
                  <Trash2 size={11} />
                  Erase
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Erase local data?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This clears all trials and ingredients from local storage.
                    This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleErase}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Erase
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            {signOutButton}
          </div>
        </>
      )}
    </div>
  );
};

/* ── AppShell ───────────────────────────────────────────────────── */

export const AppShell = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useAuth();
  const isTrials = location.pathname.startsWith("/trials");
  const isIngredients = location.pathname === "/ingredients";

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-muted/60">
      {role !== "guest" && <RoleBanner />}
      <div className="flex flex-1 overflow-hidden">
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
          {role === "guest" && (
            <div className="mt-auto">
              <SidebarIcon
                icon={<User size={18} />}
                onClick={() => navigate("/login")}
                title="Sign in"
              />
            </div>
          )}
        </aside>
        <div className="flex flex-col flex-1 overflow-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
