import { useState } from "react";
import { Plus, List, LayoutGrid, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import TrialSetupModal from "@/components/trials/TrialView/TrialSetup/TrialSetupModal";
import TrialsTable from "@/components/trials/TrialList/TrialsTable";
import { TrialCard } from "@/components/trials/TrialList/TrialCard";
import { useTrials } from "@/hooks/useTrials";
import { SENSORY_CATEGORIES } from "@/config/trial.config";
import type { SensoryCategory } from "@/config/trial.config";
import { cn } from "@/lib/utils";

export default function TrialsList() {
  const navigate = useNavigate();
  const { data: trials = [], isLoading } = useTrials();
  const [modalOpen, setModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [selectedCategory, setSelectedCategory] =
    useState<SensoryCategory>("thermo-24h");
  const [categoryOpen, setCategoryOpen] = useState(false);

  const activeCategoryConfig = SENSORY_CATEGORIES.find(
    (c) => c.key === selectedCategory,
  )!;

  return (
    <>
      {/* Topbar */}
      <header className="h-14 bg-card border-b border-border flex items-center px-5 gap-3 shrink-0">
        <Input
          placeholder="Search trials, ingredients..."
          className="max-w-95 h-9 bg-muted border-0 rounded-full"
        />
        <Button variant="outline" size="sm" className="rounded-full h-9">
          Filter
        </Button>
        <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full h-9 gap-1.5"
            >
              {activeCategoryConfig.shortLabel}
              <ChevronDown size={12} className="text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-56 p-1">
            {SENSORY_CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => {
                  setSelectedCategory(cat.key);
                  setCategoryOpen(false);
                }}
                className={cn(
                  "w-full text-left px-3 py-2 text-sm rounded-md transition-colors",
                  cat.key === selectedCategory
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                {cat.label}
              </button>
            ))}
          </PopoverContent>
        </Popover>
        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(v) => {
            if (v) setViewMode(v as "table" | "cards");
          }}
          variant="outline"
          size="sm"
        >
          <ToggleGroupItem value="table" aria-label="Table view">
            <List size={14} />
          </ToggleGroupItem>
          <ToggleGroupItem value="cards" aria-label="Card view">
            <LayoutGrid size={14} />
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

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
        <section>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-xl font-extrabold tracking-tight">Trials</h2>
            <Button
              size="sm"
              className="rounded-full"
              onClick={() => setModalOpen(true)}
            >
              <Plus size={14} className="mr-1" />
              New Trial
            </Button>
          </div>

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : viewMode === "table" ? (
            <TrialsTable
              trials={trials}
              selectedCategory={selectedCategory}
            />
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {trials.map((t) => (
                <TrialCard key={t.id} trial={t} />
              ))}
              <Card
                className="border-2 border-dashed cursor-pointer hover:bg-muted/50 transition-colors flex items-center justify-center min-h-[200px]"
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

      <TrialSetupModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSuccess={(id) => navigate(`/trials/${id}`)}
        key={modalOpen ? "open" : "closed"}
      />
    </>
  );
}
