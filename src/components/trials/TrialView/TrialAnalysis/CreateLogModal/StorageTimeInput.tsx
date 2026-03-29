import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { decomposeMinutes, parseToMinutes } from "@/lib/storageTime";
import type { StorageTimeUnit } from "@/lib/storageTime";
import { STORAGE_TIME_PRESETS } from "@/config/trial.config";
import { cn } from "@/lib/utils";

interface Props {
  value: number;
  onChange: (minutes: number) => void;
}

export const StorageTimeInput = ({ value, onChange }: Props) => {
  const decomposed = decomposeMinutes(value);
  const [unit, setUnit] = useState<StorageTimeUnit>(decomposed.unit);
  const [localAmount, setLocalAmount] = useState<string | null>(null);

  const displayAmount = localAmount ?? String(decomposed.value);

  const handleAmountChange = (raw: string) => {
    setLocalAmount(raw);
    const num = parseFloat(raw);
    if (!isNaN(num) && num >= 0) {
      onChange(parseToMinutes(num, unit));
    }
  };

  const handleAmountBlur = () => {
    setLocalAmount(null);
  };

  const handleUnitChange = (newUnit: StorageTimeUnit) => {
    setUnit(newUnit);
    const num = parseFloat(displayAmount);
    if (!isNaN(num) && num >= 0) {
      onChange(parseToMinutes(num, newUnit));
    }
  };

  const handlePreset = (minutes: number) => {
    const d = decomposeMinutes(minutes);
    setUnit(d.unit);
    setLocalAmount(null);
    onChange(minutes);
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Presets */}
      <div className="flex gap-1.5">
        {STORAGE_TIME_PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => handlePreset(preset.minutes)}
            className={cn(
              "px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer",
              value === preset.minutes
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground",
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Manual input */}
      <div className="flex gap-2">
        <Input
          type="number"
          min={0}
          step="any"
          value={displayAmount}
          onChange={(e) => handleAmountChange(e.target.value)}
          onBlur={handleAmountBlur}
          className="flex-1 h-8 text-sm"
          placeholder="0"
        />
        <Select value={unit} onValueChange={(v) => handleUnitChange(v as StorageTimeUnit)}>
          <SelectTrigger className="w-24 h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="min">Minutes</SelectItem>
            <SelectItem value="hr">Hours</SelectItem>
            <SelectItem value="day">Days</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
