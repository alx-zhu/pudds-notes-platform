import { useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

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
}: Props) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const searchIsNew =
    searchValue.trim() &&
    !suggestions.some(
      (s) => s.toLowerCase() === searchValue.trim().toLowerCase(),
    );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-normal h-8 text-sm",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <span className="truncate">{value || placeholder}</span>
          <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-(--radix-popover-trigger-width) p-0"
        align="start"
      >
        <Command>
          <CommandInput
            placeholder="Type to search or add..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>
              {searchValue.trim()
                ? "No ingredients found."
                : "No suggestions available."}
            </CommandEmpty>
            <CommandGroup>
              {suggestions.map((suggestion) => (
                <CommandItem
                  key={suggestion}
                  value={suggestion}
                  onSelect={() => {
                    onChange(suggestion);
                    setOpen(false);
                    setSearchValue("");
                  }}
                  data-checked={value === suggestion ? "true" : undefined}
                >
                  {suggestion}
                </CommandItem>
              ))}
            </CommandGroup>
            {searchIsNew && (
              <CommandGroup>
                <CommandItem
                  value={searchValue.trim()}
                  keywords={[searchValue.trim()]}
                  onSelect={() => {
                    onChange(searchValue.trim());
                    setOpen(false);
                    setSearchValue("");
                  }}
                >
                  <span className="font-semibold">+ </span>
                  Create "{searchValue.trim()}"
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
