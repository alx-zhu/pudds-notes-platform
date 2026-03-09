import { useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TrialSetupModal from "@/components/trials/TrialView/TrialSetup/TrialSetupModal";
import { useTrials } from "@/hooks/useTrials";
import { computeCompletion } from "@/lib/completion";
import { FLAVORS, PROCESSING_TYPES } from "@/config/trial.config";
import type { Trial } from "@/types/trial";
import { cn } from "@/lib/utils";

function CompletionPill({
  label,
  status,
  detail,
}: {
  label: string;
  status: "done" | "partial" | "not-started";
  detail?: string;
}) {
  return (
    <Badge
      className={cn(
        "text-[10px] font-bold rounded-full",
        status === "done" && "bg-green-100 text-green-800",
        status === "partial" && "bg-amber-100 text-amber-800",
        status === "not-started" && "bg-secondary text-secondary-foreground",
      )}
    >
      {label}
      {detail ? ` ${detail}` : status === "done" ? " ✓" : " —"}
    </Badge>
  );
}

function TrialCard({ trial }: { trial: Trial }) {
  const navigate = useNavigate();
  const completion = computeCompletion(trial);
  const setup = trial.setup;

  const variablesText = setup?.variables
    .map((v) => `${v.ingredient} ${v.percentage}%`)
    .join(" · ")
    .slice(0, 70);

  const doneCount = Object.values(trial.sensory).filter(Boolean).length;

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate(`/trials/${trial.id}`)}
    >
      <CardContent className="p-4 flex flex-col gap-2.5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-bold">
              Trial #{trial.trialNumber}
              {setup?.date
                ? ` — ${format(parseISO(setup.date), "MMM d, yyyy")}`
                : ""}
            </p>
          </div>
          <span className="text-xs text-muted-foreground">
            {completion.isFullyComplete ? "Complete" : "In Progress"}
          </span>
        </div>
        {setup && (
          <div className="flex gap-1.5 flex-wrap">
            {(() => {
              const f = FLAVORS.find((f) => f.value === setup.flavor);
              return f ? (
                <Badge className={cn("text-[10px]", f.color)}>{f.label}</Badge>
              ) : null;
            })()}
            {(() => {
              const p = PROCESSING_TYPES.find(
                (p) => p.value === setup.processingType,
              );
              return p ? (
                <Badge className={cn("text-[10px]", p.color)}>{p.label}</Badge>
              ) : null;
            })()}
          </div>
        )}
        {variablesText && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            {variablesText}
            {(setup?.variables
              .map((v) => `${v.ingredient} ${v.percentage}%`)
              .join(" · ").length ?? 0) > 70
              ? "…"
              : ""}
          </p>
        )}
        <div className="flex gap-1.5">
          <CompletionPill label="A" status={completion.setup} />
          <CompletionPill
            label="B"
            status={completion.sensory}
            detail={
              completion.sensory !== "not-started"
                ? `${doneCount}/4`
                : undefined
            }
          />
          <CompletionPill label="C" status={completion.photos} />
        </div>
      </CardContent>
    </Card>
  );
}

export default function TrialsList() {
  const navigate = useNavigate();
  const { data: trials = [], isLoading } = useTrials();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      {/* Topbar */}
      <header className="h-14 bg-card border-b border-border flex items-center px-5 gap-3 shrink-0">
        <Input
          placeholder="Search trials, ingredients..."
          className="max-w-[380px] h-9 bg-muted border-0 rounded-full"
        />
        <Button variant="outline" size="sm" className="rounded-full h-9">
          Filter
        </Button>
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
        {/* All Trials */}
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
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {trials.map((t) => (
                <TrialCard key={t.id} trial={t} />
              ))}
              {/* New Trial card */}
              <Card
                className="border-2 border-dashed cursor-pointer hover:bg-muted/50 transition-colors min-h-[120px] flex items-center justify-center"
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
