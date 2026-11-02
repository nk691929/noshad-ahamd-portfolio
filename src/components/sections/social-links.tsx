/**
 * Purpose: profile links with their logos. variant "icons" = round icon buttons (hero), "list" = icon + label
 * (contact, footer). Placeholders are hidden. Inputs: content/socials.ts. Server component.
 */
import { SocialIcon } from "@/components/ui/social-icon";
import { real } from "@/lib/content/real";
import { cn } from "@/lib/utils";
import { socials } from "@content/socials";

export function SocialLinks({
  variant = "list",
  className,
}: {
  variant?: "icons" | "list";
  className?: string;
}) {
  const links = socials.map((s) => ({ ...s, url: real(s.url) })).filter((s) => s.url);
  if (links.length === 0) return null;

  if (variant === "icons") {
    return (
      <ul className={cn("flex items-center gap-3", className)}>
        {links.map((s) => (
          <li key={s.id}>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${s.label} (opens in a new tab)`}
              className="glass inline-flex h-11 w-11 items-center justify-center rounded-full text-fg transition-colors hover:bg-surface-hover hover:text-accent"
            >
              <SocialIcon id={s.id} />
            </a>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className={cn("flex flex-col gap-3", className)}>
      {links.map((s) => (
        <li key={s.id}>
          <a
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 text-fg-muted underline-offset-4 transition-colors hover:text-fg hover:underline"
          >
            <SocialIcon id={s.id} />
            {s.label}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
