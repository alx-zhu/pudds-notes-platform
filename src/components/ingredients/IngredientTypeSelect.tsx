import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BADGE_BASE,
  INGREDIENT_TYPES,
  INGREDIENT_TYPE_MAP,
  type IngredientType,
} from "@/config/ingredient.config";
import { cn } from "@/lib/utils";

interface Props {
  value?: IngredientType;
  onChange: (value: IngredientType) => void;
}

export const IngredientTypeSelect = ({ value, onChange }: Props) => {
  const config = value ? INGREDIENT_TYPE_MAP[value] : null;

  return (
    <Select value={value ?? ""} onValueChange={(v) => onChange(v as IngredientType)}>
      <SelectTrigger className="h-6 text-xs border-0 bg-transparent shadow-none px-0 gap-1.5 w-fit cursor-pointer">
        <SelectValue placeholder="Select type...">
          {config && (
            <span className={cn(BADGE_BASE, config.style)}>
              {config.label}
            </span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {INGREDIENT_TYPES.map((t) => (
          <SelectItem key={t.value} value={t.value}>
            <span className={cn(BADGE_BASE, t.style)}>{t.label}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
