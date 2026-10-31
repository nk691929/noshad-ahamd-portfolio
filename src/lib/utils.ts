/**
 * Purpose: tiny class-name joiner (no dependency). Used by: components.
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
