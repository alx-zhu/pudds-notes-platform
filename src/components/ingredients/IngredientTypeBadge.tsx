import {
  BADGE_BASE,
  INGREDIENT_TYPE_MAP,
  type IngredientType,
} from "@/config/ingredient.config";
import { cn } from "@/lib/utils";

interface Props {
  type: IngredientType;
  className?: string;
}

export const IngredientTypeBadge = ({ type, className }: Props) => {
  const config = INGREDIENT_TYPE_MAP[type];
  return (
    <span className={cn(BADGE_BASE, config.style, className)}>
      {config.label}
    </span>
  );
};
