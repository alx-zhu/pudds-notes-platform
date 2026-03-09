import { BarChart2, FileText, LayoutGrid } from "lucide-react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarIconProps {
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

function SidebarIcon({ icon, active, onClick }: SidebarIconProps) {
  return (
    <Button
      variant={active ? "default" : "ghost"}
      size="icon"
      className={cn(
        "rounded-xl w-10 h-10 cursor-pointer",
        !active && "text-muted-foreground",
      )}
      onClick={onClick}
    >
      {icon}
    </Button>
  );
}

export default function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const isTrials = location.pathname === "/trials";

  return (
    <div className="flex h-screen overflow-hidden bg-muted/60">
      {/* Sidebar */}
      <aside className="w-16 bg-card border-r border-border flex flex-col items-center py-4 gap-2 shrink-0">
        <SidebarIcon
          icon={<LayoutGrid size={18} />}
          active={isTrials}
          onClick={() => navigate("/trials")}
        />
        <SidebarIcon icon={<FileText size={18} />} />
        <div className="mt-auto">
          <SidebarIcon icon={<BarChart2 size={18} />} />
        </div>
      </aside>

      {/* Page content (header + main) injected by each route */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
