/**
 * Purpose: link-styled button. Primary is a solid high-contrast fill (AA) with a glow on hover;
 * secondary is a glass pill. buttonClasses() styles real <button> elements the same way.
 * Used by: hero, nav, contact.
 */
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary";

export function buttonClasses(variant: ButtonVariant = "primary", className?: string): string {
  return cn(
    "inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 font-medium transition-all duration-300 ease-out-expo motion-reduce:transition-none",
    variant === "primary"
      ? "bg-fg text-bg hover:-translate-y-0.5 hover:shadow-glow"
      : "glass text-fg hover:bg-surface-hover",
    className,
  );
}

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: ButtonVariant;
  external?: boolean;
  className?: string;
};

export function Button({
  href,
  children,
  variant = "primary",
  external = false,
  className,
}: Props) {
  return (
    <a
      href={href}
      className={buttonClasses(variant, className)}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}
