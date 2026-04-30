import { ChevronDown, ArrowUp, ArrowDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { INGREDIENT_TYPES } from "@/config/ingredient.config";
import type { IngredientType } from "@/config/ingredient.config";
import { INGREDIENT_SORT_OPTIONS } from "@/types/ingredientFilters";
import type {
  IngredientFilters,
  IngredientSort,
  IngredientSortField,
} from "@/types/ingredientFilters";

interface Props {
  filters: IngredientFilters;
  onFiltersChange: (f: IngredientFilters) => void;
  sort: IngredientSort;
  onSortChange: (s: IngredientSort) => void;
}

const SOLID_OPTIONS = [
  { value: "all", label: "All" },
  { value: "solid", label: "Solid" },
  { value: "non-solid", label: "Non-Solid" },
] as const;

type SolidValue = (typeof SOLID_OPTIONS)[number]["value"];

function solidToValue(solid: boolean | null): SolidValue {
  if (solid === true) return "solid";
  if (solid === false) return "non-solid";
  return "all";
}

function valueToSolid(v: SolidValue): boolean | null {
  if (v === "solid") return true;
  if (v === "non-solid") return false;
  return null;
}

const ACTIVE_TRIGGER =
  "bg-foreground text-background hover:bg-foreground/90 hover:text-background border-transparent";

export const IngredientControls = ({
  filters,
  onFiltersChange,
  sort,
  onSortChange,
}: Props) => {
  const typeLabel = filters.type
    ? (INGREDIENT_TYPES.find((t) => t.value === filters.type)?.label ?? "All")
    : "All";

  const solidLabel =
    SOLID_OPTIONS.find((o) => o.value === solidToValue(filters.solid))?.label ??
    "All";

  const sortLabel =
    INGREDIENT_SORT_OPTIONS.find((o) => o.value === sort.field)?.label ??
    "Name";

  return (
    <div className="flex items-center gap-2">
      {/* Type */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "rounded-full h-9 gap-1.5 font-normal",
              filters.type && ACTIVE_TRIGGER,
            )}
          >
            Type: {typeLabel}
            <ChevronDown size={13} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-40">
          <DropdownMenuItem
            onClick={() => onFiltersChange({ ...filters, type: null })}
            className="flex items-center justify-between py-2 px-3"
          >
            <span>All</span>
            {!filters.type && (
              <Check size={13} className="text-muted-foreground" />
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {INGREDIENT_TYPES.map((t) => (
            <DropdownMenuItem
              key={t.value}
              onClick={() =>
                onFiltersChange({ ...filters, type: t.value as IngredientType })
              }
              className="flex items-center gap-2.5 py-2 px-3"
            >
              <span className={cn("h-2 w-2 rounded-full shrink-0", t.style)} />
              <span className="flex-1">{t.label}</span>
              {filters.type === t.value && (
                <Check size={13} className="text-muted-foreground" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Solid */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "rounded-full h-9 gap-1.5 font-normal",
              filters.solid !== null && ACTIVE_TRIGGER,
            )}
          >
            Solid: {solidLabel}
            <ChevronDown size={13} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-36">
          {SOLID_OPTIONS.map((opt) => (
            <DropdownMenuItem
              key={opt.value}
              onClick={() =>
                onFiltersChange({ ...filters, solid: valueToSolid(opt.value) })
              }
              className="flex items-center justify-between py-2 px-3"
            >
              <span>{opt.label}</span>
              {solidToValue(filters.solid) === opt.value && (
                <Check size={13} className="text-muted-foreground" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Sort */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "rounded-full h-9 gap-1.5 font-normal",
              sort.field !== "name" && ACTIVE_TRIGGER,
            )}
          >
            Sort: {sortLabel}
            <ChevronDown size={13} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-36">
          {INGREDIENT_SORT_OPTIONS.map((opt) => (
            <DropdownMenuItem
              key={opt.value}
              onClick={() =>
                onSortChange({
                  ...sort,
                  field: opt.value as IngredientSortField,
                })
              }
              className="flex items-center justify-between py-2 px-3"
            >
              <span>{opt.label}</span>
              {sort.field === opt.value && (
                <Check size={13} className="text-muted-foreground" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Direction */}
      <Button
        variant="outline"
        size="sm"
        className="rounded-full h-9 w-9 p-0"
        onClick={() =>
          onSortChange({ ...sort, dir: sort.dir === "asc" ? "desc" : "asc" })
        }
        title={sort.dir === "asc" ? "Ascending" : "Descending"}
      >
        {sort.dir === "asc" ? <ArrowUp size={13} /> : <ArrowDown size={13} />}
      </Button>
    </div>
  );
};
