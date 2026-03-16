import { cn } from "@/lib/utils";

interface Option<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: Option<T>[];
  className?: string;
}

export const CardTabToggle = <T extends string>({
  value,
  onChange,
  options,
  className,
}: Props<T>) => (
  <div className={cn("inline-flex bg-muted/50 rounded-lg p-0.5", className)}>
    {options.map((option) => (
      <button
        key={option.value}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onChange(option.value);
        }}
        className={cn(
          "text-[10px] font-semibold px-2.5 py-1 rounded-md transition-all cursor-pointer",
          option.value === value
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        {option.label}
      </button>
    ))}
  </div>
);
