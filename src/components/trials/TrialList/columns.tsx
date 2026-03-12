import { createColumnHelper } from "@tanstack/react-table";
import { format, parseISO } from "date-fns";
import type { Trial } from "@/types/trial";
import { FLAVORS, PROCESSING_TYPES } from "@/config/trial.config";
import { computeCompletion } from "@/lib/completion";
import { Badge } from "@/components/ui/badge";
import { CompletionPill } from "./CompletionPill";
import { cn } from "@/lib/utils";

const columnHelper = createColumnHelper<Trial>();

export const columns = [
  columnHelper.accessor("trialNumber", {
    header: "#",
    size: 60,
    cell: (info) => (
      <span className="text-sm font-bold tabular-nums">
        {info.getValue()}
      </span>
    ),
  }),

  columnHelper.display({
    id: "name",
    header: "Name",
    size: 200,
    minSize: 160,
    cell: ({ row }) => {
      const trial = row.original;
      const setup = trial.setup;
      const generated = setup
        ? [
            FLAVORS.find((f) => f.value === setup.flavor)?.label,
            PROCESSING_TYPES.find((p) => p.value === setup.processingType)
              ?.label,
          ]
            .filter(Boolean)
            .join(" ") +
          ` — ${format(parseISO(setup.date), "MMM d, yyyy")}`
        : null;
      const display =
        trial.name || generated || `Trial #${trial.trialNumber}`;
      const isCustom = Boolean(trial.name);
      return (
        <span
          className={cn(
            "text-sm truncate block",
            isCustom ? "font-medium" : "text-muted-foreground",
          )}
        >
          {display}
        </span>
      );
    },
  }),

  columnHelper.accessor((row) => row.setup?.date, {
    id: "date",
    header: "Date",
    size: 120,
    cell: (info) => {
      const val = info.getValue();
      return (
        <span className="text-sm text-muted-foreground">
          {val ? format(parseISO(val), "MMM d, yyyy") : "—"}
        </span>
      );
    },
  }),

  columnHelper.accessor((row) => row.setup?.processingType, {
    id: "processingType",
    header: "Processing",
    size: 110,
    cell: (info) => {
      const val = info.getValue();
      const config = PROCESSING_TYPES.find((p) => p.value === val);
      if (!config) return <span className="text-sm text-muted-foreground">—</span>;
      return (
        <Badge className={cn("text-xs font-medium", config.color)}>
          {config.label}
        </Badge>
      );
    },
  }),

  columnHelper.accessor((row) => row.setup?.flavor, {
    id: "flavor",
    header: "Flavor",
    size: 100,
    cell: (info) => {
      const val = info.getValue();
      const config = FLAVORS.find((f) => f.value === val);
      if (!config) return <span className="text-sm text-muted-foreground">—</span>;
      return (
        <Badge className={cn("text-xs font-medium", config.color)}>
          {config.label}
        </Badge>
      );
    },
  }),

  columnHelper.display({
    id: "variables",
    header: "Ingredients",
    size: 180,
    minSize: 140,
    cell: ({ row }) => {
      const vars = row.original.setup?.variables;
      if (!vars || vars.length === 0) {
        return <span className="text-sm text-muted-foreground">—</span>;
      }
      const text = vars
        .map((v) => `${v.ingredient} ${v.percentage}%`)
        .join(", ");
      return (
        <span
          className="text-sm text-muted-foreground truncate block max-w-[200px]"
          title={text}
        >
          {text}
        </span>
      );
    },
  }),

  columnHelper.display({
    id: "completion",
    header: "Status",
    size: 200,
    cell: ({ row }) => {
      const trial = row.original;
      const completion = computeCompletion(trial);
      const doneCount = Object.values(trial.sensory).filter(Boolean).length;
      return (
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
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
        </div>
      );
    },
  }),
];
