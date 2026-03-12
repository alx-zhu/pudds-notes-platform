import { cn } from "@/lib/utils";

interface MetricCellProps {
  value: number | null | undefined;
  max: number;
}

export function MetricCell({ value, max }: MetricCellProps) {
  const hasValue = value != null && value >= 1;
  const pct = hasValue ? (value / max) * 100 : 0;

  if (!hasValue) {
    return <span className="text-xs text-muted-foreground/50">—</span>;
  }

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden min-w-[32px]">
        <div
          className="h-full bg-chart-1 rounded-full transition-all duration-200"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs tabular-nums font-medium text-foreground w-[14px] text-right shrink-0">
        {value}
      </span>
    </div>
  );
}
