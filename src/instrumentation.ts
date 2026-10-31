/**
 * Purpose: runs once when the Next.js server starts; validates env vars so misconfiguration fails fast.
 * Used by: Next.js (instrumentation hook).
 */
export async function register() {
  const { getEnv } = await import("@/lib/env");
  getEnv();
}
