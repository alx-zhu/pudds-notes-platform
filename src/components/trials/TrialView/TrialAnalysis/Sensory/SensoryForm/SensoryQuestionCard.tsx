import { useState } from "react";
import { ChevronDown, Check } from "lucide-react";
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
  id: string;
  index: number;
  total: number;
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

export const SensoryQuestionCard = ({
  id,
  index,
  total,
  metric,
  options,
  value,
  comment,
  onRate,
  onCommentChange,
}: Props) => {
  const [descOpen, setDescOpen] = useState(false);
  const [commentOpen, setCommentOpen] = useState(() => Boolean(comment?.trim()));
  const isAnswered = value != null && value >= 1;

  return (
    <div
      id={id}
      className={cn(
        "rounded-xl border bg-card p-6 transition-colors scroll-mt-7",
        isAnswered && "border-l-3 border-l-green-500",
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
            Question {index + 1} of {total}
          </div>
          <div className="text-base font-semibold text-foreground">
            {metric.label}
          </div>
          <div className="text-sm text-muted-foreground mt-0.5">
            {metric.description}
          </div>

          {/* Expandable rating descriptions */}
          <Collapsible open={descOpen} onOpenChange={setDescOpen}>
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="mt-2.5 inline-flex items-center gap-1.5 text-xs text-primary cursor-pointer hover:underline"
              >
                <ChevronDown
                  size={12}
                  className={cn(
                    "transition-transform",
                    descOpen && "rotate-180",
                  )}
                />
                {descOpen ? "Hide rating descriptions" : "View rating descriptions"}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-3 p-3 bg-muted/50 border rounded-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {options.map((opt) => (
                    <div
                      key={opt.score}
                      className="flex gap-2 p-2 bg-card border rounded-md"
                    >
                      <span className="font-bold text-primary text-sm min-w-[16px]">
                        {opt.score}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {opt.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Answered badge */}
        {isAnswered && (
          <span className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-600 border border-green-200">
            <Check size={12} />
            Answered
          </span>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-border my-5" />

      {/* Rating scale */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Your rating
        </div>
        <div className="flex gap-2">
          {options.map((opt) => {
            const isSelected = value === opt.score;
            return (
              <button
                key={opt.score}
                type="button"
                onClick={() => onRate(isSelected ? 0 : opt.score)}
                className={cn(
                  "flex-1 flex flex-col items-center gap-1 py-3 px-1.5 rounded-lg border-2 cursor-pointer transition-all text-center",
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border bg-card hover:border-primary/50 hover:bg-primary/5",
                )}
              >
                <span
                  className={cn(
                    "text-lg font-bold leading-none",
                    isSelected ? "text-primary" : "text-foreground",
                  )}
                >
                  {opt.score}
                </span>
                <span
                  className={cn(
                    "text-[11px] font-medium leading-tight",
                    isSelected ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {opt.label.split("(")[0].trim()}
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex justify-between mt-1.5 text-[11px] text-muted-foreground">
          <span>1 — {options[0].label.split("(")[0].trim()}</span>
          <span>5 — {options[options.length - 1].label.split("(")[0].trim()}</span>
        </div>
      </div>

      {/* Comment section */}
      <div className="mt-4">
        <Collapsible open={commentOpen} onOpenChange={setCommentOpen}>
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer hover:text-foreground"
            >
              <ChevronDown
                size={12}
                className={cn(
                  "transition-transform",
                  commentOpen && "rotate-180",
                )}
              />
              {commentOpen ? "Hide note" : "Add a note or comment"}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-2.5">
              <Textarea
                placeholder="Optional — share any context, specific examples, or suggestions..."
                value={comment ?? ""}
                onChange={(e) => onCommentChange(e.target.value)}
                className="min-h-[72px] text-sm resize-y"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};
