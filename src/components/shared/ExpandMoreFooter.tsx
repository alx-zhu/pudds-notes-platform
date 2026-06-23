import { ChevronDown, ChevronUp } from "lucide-react";
import { CardFooter } from "@/components/ui/card";

interface Props {
  expanded: boolean;
  remaining: number;
  onToggle: () => void;
}

/**
 * Footer toggle button for expandable card sections.
 * Use with `useExpandable` hook to manage state.
 */
export function ExpandMoreFooter({ expanded, remaining, onToggle }: Props) {
  return (
    <CardFooter className="justify-center border-t p-0">
      <button
        className="w-full flex items-center justify-center gap-1 py-3 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        onClick={onToggle}
      >
        {expanded ? (
          <>
            <ChevronUp size={12} />
            Show less
          </>
        ) : (
          <>
            <ChevronDown size={12} />
            {remaining} more
          </>
        )}
      </button>
    </CardFooter>
  );
}
