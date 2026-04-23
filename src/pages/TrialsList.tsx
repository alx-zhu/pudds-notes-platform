import { useState, useMemo } from "react";
import { Plus, List, LayoutGrid } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useReadOnly } from "@/contexts/ReadOnlyContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { TrialSetupModal } from "@/components/trials/TrialView/TrialSetup/TrialSetupModal";
import { TrialsTable } from "@/components/trials/TrialList/TrialsTable";
import { TrialCard } from "@/components/trials/TrialList/TrialCard";
import { FilterPopover } from "@/components/trials/TrialList/FilterPopover";
import { ActiveFiltersBar } from "@/components/trials/TrialList/ActiveFiltersBar";
import { useTrials, useDeleteTrial } from "@/hooks/useTrials";
import { EMPTY_FILTERS, DEFAULT_SORT } from "@/types/filters";
import type { TrialFilters, SortByScore } from "@/types/filters";
import { filterTrials, sortTrialsByScore } from "@/lib/filterTrials";

interface TrialsListProps {
  onSelectTrial?: (id: string) => void;
}

export const TrialsList = ({ onSelectTrial }: TrialsListProps = {}) => {
  const navigate = useNavigate();
  const isReadOnly = useReadOnly();
  const { data: trials = [], isLoading } = useTrials();
  const deleteTrial = useDeleteTrial();
  const [modalOpen, setModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [filters, setFilters] = useState<TrialFilters>(EMPTY_FILTERS);
  const [sortBy, setSortBy] = useState<SortByScore>(DEFAULT_SORT);

  const displayTrials = useMemo(
    () => sortTrialsByScore(filterTrials(trials, filters), sortBy),
    [trials, filters, sortBy],
  );

  return (
    <>
      {/* Topbar */}
      <header className="h-14 bg-card border-b border-border flex items-center px-5 gap-3 shrink-0">
        <Input
          placeholder="Search trials, ingredients..."
          className="max-w-95 h-9 bg-muted border-0 rounded-full"
        />
        <FilterPopover
          filters={filters}
          onFiltersChange={setFilters}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(v) => {
            if (v) setViewMode(v as "table" | "cards");
          }}
          variant="outline"
          size="sm"
        >
          <ToggleGroupItem
            value="table"
            aria-label="Table view"
            className="cursor-pointer"
          >
            <List size={14} />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="cards"
            aria-label="Card view"
            className="cursor-pointer"
          >
            <LayoutGrid size={14} />
          </ToggleGroupItem>
        </ToggleGroup>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
        <section>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-xl font-extrabold tracking-tight">
              Trials
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({displayTrials.length})
              </span>
            </h2>
            {!isReadOnly && (
              <Button
                size="sm"
                className="rounded-full"
                onClick={() => setModalOpen(true)}
              >
                <Plus size={14} className="mr-1" />
                New Trial
              </Button>
            )}
          </div>

          <ActiveFiltersBar
            filters={filters}
            onFiltersChange={setFilters}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : viewMode === "table" ? (
            <TrialsTable
              trials={displayTrials}
              sortBy={sortBy}
              onDelete={deleteTrial.mutate}
              onSelect={onSelectTrial}
            />
          ) : (
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              }}
            >
              {displayTrials.map((t) => (
                <TrialCard
                  key={t.id}
                  trial={t}
                  sortBy={sortBy}
                  onDelete={deleteTrial.mutate}
                  onSelect={onSelectTrial}
                />
              ))}
              {!isReadOnly && (
                <div
                  className="rounded-xl border-2 border-dashed border-border bg-transparent cursor-pointer hover:bg-muted/30 transition-colors flex items-center justify-center min-h-40"
                  onClick={() => setModalOpen(true)}
                >
                  <div className="flex flex-col items-center gap-1 text-muted-foreground">
                    <Plus size={28} />
                    <span className="text-xs font-semibold">New Trial</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <TrialSetupModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSuccess={(id) => navigate(`/trials/${id}`)}
        key={modalOpen ? "open" : "closed"}
      />
    </>
  );
};
