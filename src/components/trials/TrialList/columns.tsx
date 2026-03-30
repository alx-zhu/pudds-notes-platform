import { createColumnHelper } from "@tanstack/react-table";
import { format, parseISO } from "date-fns";
import type { Trial } from "@/types/trial";
import {
  FLAVORS,
  PROCESSING_TYPES,
  SENSORY_CATEGORY_STYLES,
} from "@/config/trial.config";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getPinnedFormulation, getMostRecentEval } from "@/lib/trialDisplay";

const columnHelper = createColumnHelper<Trial>();

export const columns = [
  columnHelper.accessor("trialNumber", {
    header: "#",
    size: 48,
    cell: (info) => (
      <span className="text-[15px] font-extrabold tabular-nums tracking-tight">
        {info.getValue()}
      </span>
    ),
  }),

  columnHelper.display({
    id: "formulation",
    header: "Formulation",
    size: 200,
    cell: ({ row }) => {
      const items = getPinnedFormulation(row.original.ingredients);
      if (items.length === 0) {
        return <span className="text-sm text-muted-foreground">—</span>;
      }
      return (
        <span className="text-[13px] font-medium">
          {items.map((item, i) => (
            <span key={item.abbreviation}>
              {i > 0 && <span className="text-border mx-1">/</span>}
              <span className="font-bold">{item.abbreviation}</span>{" "}
              <span className="text-muted-foreground tabular-nums">
                {item.percentage}%
              </span>
            </span>
          ))}
        </span>
      );
    },
  }),

  columnHelper.display({
    id: "mostRecentEval",
    header: "Most Recent Eval",
    size: 160,
    cell: ({ row }) => {
      const eval_ = getMostRecentEval(row.original);
      if (!eval_) {
        return <span className="text-sm text-muted-foreground">—</span>;
      }
      return (
        <span className="text-[13px] font-medium">{eval_.label}</span>
      );
    },
  }),

  columnHelper.display({
    id: "scores",
    header: "Scores",
    size: 300,
    cell: ({ row }) => {
      const eval_ = getMostRecentEval(row.original);
      if (!eval_) {
        return (
          <span className="text-[11px] text-muted-foreground/50 italic">
            No evaluations
          </span>
        );
      }

      const { scores } = eval_;
      return (
        <div className="flex items-baseline gap-4">
          {/* Overall */}
          <span className="inline-flex items-baseline gap-1">
            <span className="text-[11px] font-medium text-muted-foreground">
              Overall
            </span>
            <span className="text-sm font-bold tabular-nums">
              {scores.overall != null ? scores.overall.toFixed(1) : "—"}
            </span>
          </span>

          {/* Category scores */}
          {scores.categories.map((cat) => {
            const style = SENSORY_CATEGORY_STYLES[cat.key];
            return (
              <span key={cat.key} className="inline-flex items-baseline gap-1">
                <span className="text-[11px] font-medium text-muted-foreground">
                  {cat.label}
                </span>
                <span
                  className={cn(
                    "text-sm font-bold tabular-nums",
                    style?.number ?? "text-foreground",
                  )}
                >
                  {cat.score != null ? cat.score.toFixed(1) : "—"}
                </span>
              </span>
            );
          })}
        </div>
      );
    },
  }),

  columnHelper.accessor((row) => row.setup?.date, {
    id: "date",
    header: "Date",
    size: 90,
    cell: (info) => {
      const val = info.getValue();
      return (
        <span className="text-[13px] text-muted-foreground">
          {val ? format(parseISO(val), "MMM d") : "—"}
        </span>
      );
    },
  }),

  columnHelper.accessor((row) => row.setup?.processingType, {
    id: "processingType",
    header: "Processing",
    size: 90,
    cell: (info) => {
      const val = info.getValue();
      const config = PROCESSING_TYPES.find((p) => p.value === val);
      if (!config) {
        return <span className="text-sm text-muted-foreground">—</span>;
      }
      return (
        <Badge className={cn("text-[11px] font-medium", config.color)}>
          {config.label}
        </Badge>
      );
    },
  }),

  columnHelper.accessor((row) => row.setup?.flavor, {
    id: "flavor",
    header: "Flavor",
    size: 90,
    cell: (info) => {
      const val = info.getValue();
      const config = FLAVORS.find((f) => f.value === val);
      if (!config) {
        return <span className="text-sm text-muted-foreground">—</span>;
      }
      return (
        <Badge className={cn("text-[11px] font-medium", config.color)}>
          {config.label}
        </Badge>
      );
    },
  }),
];
