/**
 * Purpose: resolve the Supabase settings from environment variables. Pure function (unit-tested).
 * Names (new first, legacy still accepted so existing deployments keep working):
 *   URL:             NEXT_PUBLIC_SUPABASE_URL | SUPABASE_URL
 *   Publishable key: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY | SUPABASE_PUBLISHABLE_KEY | SUPABASE_ANON_KEY
 *   Secret key:      SUPABASE_SECRET_KEY | SUPABASE_SERVICE_ROLE_KEY   (SERVER ONLY, never NEXT_PUBLIC_)
 * The publishable key is designed to be public and is limited by Row Level Security. The secret key bypasses RLS and
 * is used only by the server action that writes comments.
 */
export type SupabaseConfig = { url: string; publishableKey: string; secretKey: string | undefined };

type Env = Record<string, string | undefined>;

const pick = (...values: (string | undefined)[]) =>
  values.find((v) => v && v.trim() !== "")?.trim();

export function resolveSupabaseConfig(env: Env): SupabaseConfig | null {
  const url = pick(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_URL);
  const publishableKey = pick(
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    env.SUPABASE_PUBLISHABLE_KEY,
    env.SUPABASE_ANON_KEY,
  );
  if (!url || !publishableKey) return null;
  return {
    url: url.replace(/\/$/, ""),
    publishableKey,
    secretKey: pick(env.SUPABASE_SECRET_KEY, env.SUPABASE_SERVICE_ROLE_KEY),
  };
}
