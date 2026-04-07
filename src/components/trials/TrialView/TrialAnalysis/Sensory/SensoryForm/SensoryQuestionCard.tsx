import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { SensoryMetricKey } from "@/config/trial.config";

interface ScoreOption {
  readonly score: number;
  readonly label: string;
}

interface Props {
  index: number;
  metric: {
    key: SensoryMetricKey;
    label: string;
    description: string;
    max: number;
  };
  options: readonly ScoreOption[];
  value: number | undefined;
  comment: string | undefined;
  onRate: (value: number) => void;
  onCommentChange: (comment: string) => void;
}

// Extract the parenthetical reference text from a label like "Not sweet at all (Unsweetened plain Greek yogurt)"
const extractReference = (label: string): string | null =>
  label.match(/\((.+)\)/)?.[1] ?? null;

export const SensoryQuestionCard = ({
  index,
  metric,
  options,
  value,
  comment,
  onRate,
  onCommentChange,
}: Props) => {
  const [refOpen, setRefOpen] = useState(false);
  const [commentOpen, setCommentOpen] = useState(() => Boolean(comment?.trim()));
  const isAnswered = value != null && value >= 1;

  const references = options
    .map((opt) => ({ score: opt.score, ref: extractReference(opt.label) }))
    .filter((r): r is { score: number; ref: string } => r.ref !== null);

  const hasReferences = references.length > 0;

  return (
    <div
      className={cn(
        "rounded-xl border bg-card transition-colors",
        isAnswered && "border-l-[3px] border-l-green-500",
      )}
    >
      <div className="p-6">
        {/* Question header */}
        <div className="flex items-start gap-3 mb-5">
          <span
            className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5",
              isAnswered
                ? "bg-green-500 text-white"
                : "border border-border text-muted-foreground",
            )}
          >
            {isAnswered ? <Check size={10} /> : index + 1}
          </span>
          <div className="min-w-0">
            <div className="text-[15px] font-semibold text-foreground leading-snug">
              {metric.label}
            </div>
            <div className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
              {metric.description}
            </div>
          </div>
        </div>

        {/* Rating buttons */}
        <div className="flex gap-2">
          {options.map((opt) => {
            const mainLabel = opt.label.split("(")[0].trim();
            const isSelected = value === opt.score;
            return (
              <button
                key={opt.score}
                type="button"
                onClick={() => onRate(isSelected ? 0 : opt.score)}
                className={cn(
                  "flex-1 flex flex-col items-center gap-1.5 py-3.5 px-1 rounded-lg border-2 cursor-pointer transition-all text-center",
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border bg-card hover:border-primary/40 hover:bg-primary/[0.03]",
                )}
              >
                <span
                  className={cn(
                    "text-[17px] font-bold leading-none",
                    isSelected ? "text-primary" : "text-foreground",
                  )}
                >
                  {opt.score}
                </span>
                <span
                  className={cn(
                    "text-[10.5px] font-medium leading-tight",
                    isSelected ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {mainLabel}
                </span>
              </button>
            );
          })}
        </div>

        {/* References — only shown for metrics with physical reference standards */}
        {hasReferences && (
          <Collapsible open={refOpen} onOpenChange={setRefOpen}>
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="mt-3.5 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <ChevronDown
                  size={11}
                  className={cn(
                    "transition-transform",
                    refOpen && "rotate-180",
                  )}
                />
                References
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 space-y-0.5">
                {references.map(({ score, ref }) => (
                  <div key={score} className="flex gap-2.5 text-xs py-0.5">
                    <span className="font-bold text-primary min-w-[14px]">
                      {score}
                    </span>
                    <span className="text-muted-foreground">{ref}</span>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Note */}
        <div className="mt-3.5">
          <Collapsible open={commentOpen} onOpenChange={setCommentOpen}>
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <ChevronDown
                  size={11}
                  className={cn(
                    "transition-transform",
                    commentOpen && "rotate-180",
                  )}
                />
                {commentOpen ? "Hide note" : "Add note"}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2">
                <Textarea
                  placeholder="Optional note..."
                  value={comment ?? ""}
                  onChange={(e) => onCommentChange(e.target.value)}
                  className="min-h-[64px] text-sm resize-none"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </div>
  );
};
