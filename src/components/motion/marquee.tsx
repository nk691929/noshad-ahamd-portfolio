/**
 * Purpose: infinite horizontal marquee in pure CSS (compositor-only transform). The duplicate list is aria-hidden.
 * Under reduced motion it becomes a static wrapped list (see sections.css). Pauses on hover/focus.
 * Inputs: items (labels). Server component. Used by: About.
 */
import { Badge } from "@/components/ui/badge";

export function Marquee({ items, label }: { items: readonly string[]; label: string }) {
  return (
    <div className="marquee" role="group" aria-label={label}>
      <div className="marquee__inner">
        <ul className="marquee__list">
          {items.map((item) => (
            <li key={item}>
              <Badge>{item}</Badge>
            </li>
          ))}
        </ul>
        <ul className="marquee__list marquee__dup" aria-hidden="true">
          {items.map((item) => (
            <li key={item}>
              <Badge>{item}</Badge>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
