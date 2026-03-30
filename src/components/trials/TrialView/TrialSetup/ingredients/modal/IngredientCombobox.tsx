import { useMemo } from "react";
import { StringCombobox } from "@/components/shared/StringCombobox";
import type { Ingredient } from "@/types/ingredient";

interface Props {
  value: string;
  onChange: (value: string) => void;
  ingredients: Ingredient[];
  placeholder?: string;
  className?: string;
}

export const IngredientCombobox = ({
  value,
  onChange,
  ingredients,
  placeholder = "Select ingredient...",
  className,
}: Props) => {
  const suggestions = useMemo(
    () => ingredients.map((i) => i.name),
    [ingredients],
  );

  return (
    <StringCombobox
      value={value}
      onChange={onChange}
      suggestions={suggestions}
      placeholder={placeholder}
      searchPlaceholder="Type to search or add..."
      emptyMessage="No ingredients found."
      className={className}
    />
  );
};
