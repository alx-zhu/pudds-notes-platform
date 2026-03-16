import { useState } from "react";
import { Plus, Minus, CalendarIcon, X } from "lucide-react";
import { format, parseISO } from "date-fns";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

interface DateRangeFilterSectionProps {
  from: string | null;
  to: string | null;
  onChange: (from: string | null, to: string | null) => void;
}

export const DateRangeFilterSection = ({
  from,
  to,
  onChange,
}: DateRangeFilterSectionProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between py-3 text-sm font-semibold hover:text-foreground/80 transition-colors">
        Date Range
        {open ? <Minus size={16} /> : <Plus size={16} />}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="flex flex-col gap-2 pb-3">
          <DatePickerField
            label="From"
            value={from}
            onChange={(v) => onChange(v, to)}
          />
          <DatePickerField
            label="To"
            value={to}
            onChange={(v) => onChange(from, v)}
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

const DatePickerField = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
}) => {
  const [popoverOpen, setPopoverOpen] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground w-10">{label}</span>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 justify-start text-xs font-normal h-8"
          >
            <CalendarIcon size={12} className="mr-1.5" />
            {value ? format(parseISO(value), "MMM d, yyyy") : "Select date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value ? parseISO(value) : undefined}
            onSelect={(date) => {
              onChange(date ? date.toISOString().split("T")[0] : null);
              setPopoverOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
      {value && (
        <button
          onClick={() => onChange(null)}
          className="text-muted-foreground hover:text-foreground"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};
