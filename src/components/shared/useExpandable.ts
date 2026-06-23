import { useState } from "react";

/**
 * Manages expand/collapse state for a list of items with a visible limit.
 * Pair with <ExpandMoreFooter> to render the toggle button.
 */
export function useExpandable<T>(items: T[], maxVisible: number = 5) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = items.length > maxVisible;
  const visibleItems = expanded ? items : items.slice(0, maxVisible);
  const remaining = items.length - maxVisible;
  const toggle = () => setExpanded((e) => !e);

  return { expanded, hasMore, visibleItems, remaining, toggle };
}
