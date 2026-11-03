/**
 * Purpose: the server-side Supabase client for this site: a thin fetch wrapper around the PostgREST API. Server only.
 * Why not @supabase/ssr or supabase-js? Those exist for cookie-based user sessions and browser clients. This site has
 * no user accounts and never talks to Supabase from the browser, so they would add dependencies and client JavaScript
 * for no benefit. Reads use the publishable key (limited by RLS); writes use the secret key, only in server actions.
 * Used by: lib/comments.ts, app/api/comments/route.ts.
 */
import { resolveSupabaseConfig } from "./config";

export const supabaseConfig = () => resolveSupabaseConfig(process.env);

type Options = {
  role: "public" | "secret";
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  prefer?: string;
};

/** Returns null when Supabase is not configured or the network request fails (the cause is logged, never the keys). */
export async function supabaseRest(path: string, options: Options): Promise<Response | null> {
  const cfg = supabaseConfig();
  if (!cfg) return null;
  const key = options.role === "secret" ? cfg.secretKey : cfg.publishableKey;
  if (!key) return null;

  const headers: Record<string, string> = { apikey: key, "Content-Type": "application/json" };
  // New sb_... keys are not JWTs and must only be sent in the apikey header; legacy JWT keys go in both.
  if (!key.startsWith("sb_")) headers.Authorization = `Bearer ${key}`;
  if (options.prefer) headers.Prefer = options.prefer;

  try {
    return await fetch(`${cfg.url}/rest/v1/${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      cache: "no-store",
    });
  } catch (error) {
    console.error("[supabase] network error:", error instanceof Error ? error.message : "unknown");
    return null;
  }
}

/** Safe diagnostics: status and the first part of the error body (no keys are ever in it). */
export async function logSupabaseFailure(label: string, res: Response): Promise<void> {
  let detail = "";
  try {
    detail = (await res.text()).slice(0, 300);
  } catch {
    detail = "(unreadable body)";
  }
  console.error(`[supabase] ${label} failed: HTTP ${res.status} ${detail}`);
}
