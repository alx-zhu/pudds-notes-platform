import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onCommit: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const InlineInput = ({
  value,
  onCommit,
  placeholder = "—",
  className,
}: Props) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const commit = () => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed !== value) onCommit(trimmed);
  };

  if (!editing) {
    return (
      <span
        className={cn(
          "cursor-text rounded px-1 -mx-1 hover:bg-muted",
          !value && "text-muted-foreground",
          className,
        )}
        onClick={() => setEditing(true)}
      >
        {value || placeholder}
      </span>
    );
  }

  return (
    <input
      ref={inputRef}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") {
          setDraft(value);
          setEditing(false);
        }
      }}
      className={cn(
        "bg-transparent border-b border-ring outline-none px-1 -mx-1 text-sm w-full",
        className,
      )}
      placeholder={placeholder}
    />
  );
};
