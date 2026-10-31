/**
 * Purpose: small pill label (tags, status). Used by: project cards, experience.
 */
import { cn } from "@/lib/utils";

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-surface px-3 py-1 text-xs text-fg-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}
