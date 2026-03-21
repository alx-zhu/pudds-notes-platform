import { StringCombobox } from "@/components/trials/shared/StringCombobox";

interface Props {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
  className?: string;
}

export const IngredientCombobox = ({
  value,
  onChange,
  suggestions,
  placeholder = "Select ingredient...",
  className,
}: Props) => (
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
