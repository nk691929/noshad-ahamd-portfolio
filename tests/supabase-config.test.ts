/**
 * Purpose: Supabase settings resolve from the new and legacy variable names, and the secret key is never confused with
 * the public one.
 */
import { describe, expect, it } from "vitest";
import { resolveSupabaseConfig } from "@/lib/supabase/config";

describe("resolveSupabaseConfig", () => {
  it("returns null until a URL and a publishable key exist", () => {
    expect(resolveSupabaseConfig({})).toBeNull();
    expect(resolveSupabaseConfig({ NEXT_PUBLIC_SUPABASE_URL: "https://a.supabase.co" })).toBeNull();
  });

  it("prefers the new names and trims a trailing slash", () => {
    const cfg = resolveSupabaseConfig({
      NEXT_PUBLIC_SUPABASE_URL: "https://new.supabase.co/",
      SUPABASE_URL: "https://old.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_new",
      SUPABASE_ANON_KEY: "old-anon-key",
    });
    expect(cfg).toEqual({
      url: "https://new.supabase.co",
      publishableKey: "sb_publishable_new",
      secretKey: undefined,
    });
  });

  it("still accepts the legacy names", () => {
    const cfg = resolveSupabaseConfig({
      SUPABASE_URL: "https://old.supabase.co",
      SUPABASE_ANON_KEY: "legacy-anon-key",
    });
    expect(cfg?.publishableKey).toBe("legacy-anon-key");
  });

  it("keeps the secret key separate and optional", () => {
    const cfg = resolveSupabaseConfig({
      SUPABASE_URL: "https://x.supabase.co",
      SUPABASE_ANON_KEY: "public-key",
      SUPABASE_SECRET_KEY: "sb_secret_abc",
    });
    expect(cfg?.secretKey).toBe("sb_secret_abc");
    expect(cfg?.publishableKey).toBe("public-key");
  });
});
