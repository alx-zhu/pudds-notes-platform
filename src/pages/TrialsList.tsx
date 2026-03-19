import { useState, useMemo } from "react";
import { Plus, List, LayoutGrid, SlidersHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { TrialSetupModal } from "@/components/trials/TrialView/TrialSetup/TrialSetupModal";
import { TrialsTable } from "@/components/trials/TrialList/TrialsTable";
import { TrialCard } from "@/components/trials/TrialList/TrialCard";
import { FilterSidebar } from "@/components/trials/TrialList/FilterSidebar/FilterSidebar";
import { ActiveFiltersBar } from "@/components/trials/TrialList/ActiveFiltersBar";
import { useTrials } from "@/hooks/useTrials";
import { EMPTY_FILTERS, type TrialFilters } from "@/types/filters";
import { filterTrials, countActiveFilters } from "@/lib/filterTrials";
import type { SensoryMetricKey } from "@/config/trial.config";
import { cn } from "@/lib/utils";

export const TrialsList = () => {
  const navigate = useNavigate();
  const { data: trials = [], isLoading } = useTrials();
  const [modalOpen, setModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "cards">("cards");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filters, setFilters] = useState<TrialFilters>(EMPTY_FILTERS);

  const filteredTrials = useMemo(
    () => filterTrials(trials, filters),
    [trials, filters],
  );

  const activeFilterCount = countActiveFilters(filters);

  const hasSensoryFilters = Object.keys(filters.sensoryRanges).length > 0;
  const activeMetricKeys = Object.keys(
    filters.sensoryRanges,
  ) as SensoryMetricKey[];

  return (
    <>
      {/* Topbar */}
      <header className="h-14 bg-card border-b border-border flex items-center px-5 gap-3 shrink-0">
        <Input
          placeholder="Search trials, ingredients..."
          className="max-w-95 h-9 bg-muted border-0 rounded-full"
        />
        <Button
          variant={sidebarOpen ? "default" : "outline"}
          size="sm"
          className="rounded-full h-9 gap-1.5"
          onClick={() => setSidebarOpen((prev) => !prev)}
        >
          <SlidersHorizontal size={14} />
          Filter
          {activeFilterCount > 0 && (
            <Badge
              variant="secondary"
              className="ml-0.5 h-4 min-w-4 px-1 text-[10px] leading-none"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>
        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(v) => {
            if (v) setViewMode(v as "table" | "cards");
          }}
          variant="outline"
          size="sm"
        >
          <ToggleGroupItem value="cards" aria-label="Card view">
            <LayoutGrid size={14} />
          </ToggleGroupItem>
          <ToggleGroupItem value="table" aria-label="Table view">
            <List size={14} />
          </ToggleGroupItem>
        </ToggleGroup>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-9 w-9"
          >
            🔔
          </Button>
          <div className="w-9 h-9 rounded-full bg-muted" />
        </div>
      </header>

      {/* Content area with optional sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && (
          <FilterSidebar filters={filters} onFiltersChange={setFilters} />
        )}

        <main className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
          <section>
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-xl font-extrabold tracking-tight">
                Trials
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({filteredTrials.length})
                </span>
              </h2>
              <Button
                size="sm"
                className="rounded-full"
                onClick={() => setModalOpen(true)}
              >
                <Plus size={14} className="mr-1" />
                New Trial
              </Button>
            </div>

            {/* Active filters bar — directly above the grid/table */}
            <ActiveFiltersBar filters={filters} onFiltersChange={setFilters} />

            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : viewMode === "table" ? (
              <TrialsTable trials={filteredTrials} />
            ) : (
              <div
                className={cn(
                  "grid gap-3",
                  sidebarOpen ? "grid-cols-3" : "grid-cols-4",
                )}
              >
                {filteredTrials.map((t) => (
                  <TrialCard
                    key={t.id}
                    trial={t}
                    matchingLogs={t.matchingLogs}
                    sensoryFiltersActive={hasSensoryFilters}
                    activeMetricKeys={activeMetricKeys}
                  />
                ))}
                <Card
                  className="border-2 border-dashed cursor-pointer hover:bg-muted/50 transition-colors flex items-center justify-center min-h-40"
                  onClick={() => setModalOpen(true)}
                >
                  <CardContent className="p-4 flex flex-col items-center gap-1 text-muted-foreground">
                    <Plus size={28} />
                    <span className="text-xs font-semibold">New Trial</span>
                  </CardContent>
                </Card>
              </div>
            )}
          </section>
        </main>
      </div>

      <TrialSetupModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSuccess={(id) => navigate(`/trials/${id}`)}
        key={modalOpen ? "open" : "closed"}
      />
    </>
  );
};
