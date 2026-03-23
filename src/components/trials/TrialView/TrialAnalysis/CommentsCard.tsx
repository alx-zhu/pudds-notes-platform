import { MessageSquare } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { useTrial } from "@/hooks/useTrials";
import { SENSORY_METRICS } from "@/config/trial.config";
import type { SensoryMetricKey } from "@/config/trial.config";
import { getLogLabel } from "@/lib/analysisLog";

interface CommentEntry {
  logId: string;
  logLabel: string;
  metricKey: SensoryMetricKey;
  metricLabel: string;
  comment: string;
}

interface Props {
  trialId: string;
}

export const CommentsCard = ({ trialId }: Props) => {
  const { data: trial } = useTrial(trialId);
  const logs = trial?.analysisLogs ?? [];

  const allComments: CommentEntry[] = logs.flatMap((log) =>
    log.evaluations.flatMap((ev) => {
      if (!ev.comments) return [];
      return Object.entries(ev.comments)
        .filter(([, value]) => value?.trim())
        .map(([key, value]) => ({
          logId: log.id,
          logLabel: `${getLogLabel(log)} · ${ev.label}`,
          metricKey: key as SensoryMetricKey,
          metricLabel:
            SENSORY_METRICS.find((m) => m.key === key)?.label ?? key,
          comment: value!,
        }));
    }),
  );

  if (allComments.length === 0) return null;

  return (
    <Card className="flex flex-col overflow-hidden gap-0">
      <CardHeader className="py-3 px-5 flex items-center justify-between border-b shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="h-6 w-6 rounded-md bg-amber-100 flex items-center justify-center">
            <MessageSquare size={13} className="text-amber-600" />
          </div>
          <p className="text-sm font-semibold text-foreground">
            Sensory Comments
          </p>
        </div>
        <span className="text-xs tabular-nums text-muted-foreground">
          {allComments.length}
        </span>
      </CardHeader>

      <CardContent className="p-4">
        <div className="flex flex-col gap-2.5">
          {allComments.map((entry) => (
            <div
              key={`${entry.logId}-${entry.metricKey}`}
              className="flex gap-3 rounded-lg bg-muted/50 px-4 py-3 ring-1 ring-border/40"
            >
              <div className="w-0.5 shrink-0 rounded-full bg-amber-400" />
              <div className="flex flex-col gap-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-foreground bg-background px-2 py-0.5 rounded-md ring-1 ring-border/60">
                    {entry.metricLabel}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {entry.logLabel}
                  </span>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {entry.comment}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
