/**
 * Purpose: three-dot skill tier indicator (core=3, proficient=2, familiar=1). Never shows percentages.
 * Inputs: tier + visible label (used as the accessible name). Used by: skills section.
 */
import { cn } from "@/lib/utils";

const LEVEL = { core: 3, proficient: 2, familiar: 1 } as const;

export function TierDots({ tier, label }: { tier: keyof typeof LEVEL; label: string }) {
  return (
    <span role="img" aria-label={label} className="inline-flex gap-1">
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className={cn(
            "h-2 w-2 rounded-full",
            n <= LEVEL[tier] ? "bg-accent-2" : "bg-border-strong",
          )}
        />
      ))}
    </span>
  );
}
