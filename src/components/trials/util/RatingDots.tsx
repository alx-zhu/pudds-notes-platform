import { cn } from "@/lib/utils";

interface RatingDotsProps {
  value: number | null;
  max: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
}

export default function RatingDots({
  value,
  max,
  onChange,
  readOnly = false,
}: RatingDotsProps) {
  const dots = Array.from({ length: max }, (_, i) => i + 1);

  return (
    <div className="flex gap-1" role="group">
      {dots.map((n) => {
        const filled = value !== null && n <= value;
        return (
          <button
            key={n}
            type="button"
            disabled={readOnly}
            onClick={() => {
              if (!readOnly && onChange) {
                onChange(value === n ? 0 : n);
              }
            }}
            className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors",
              filled
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground border border-border",
              !readOnly && "cursor-pointer hover:opacity-80",
              readOnly && "cursor-default",
            )}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}
