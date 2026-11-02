/**
 * Purpose: validation for visitor comments, and a tiny Supabase REST client (fetch only, no SDK). Server only.
 * Comments are inserted unapproved; row level security (supabase/comments.sql) lets visitors read approved ones only,
 * so nothing appears until you approve it in the Supabase dashboard.
 * Used by: sections/comments.tsx, app/actions/comments.ts, tests.
 */
import { z } from "zod";
import { getEnv } from "@/lib/env";
import type { CommentItem } from "@/lib/comments-types";

const noLinks = (v: string) =>
  !/(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|io|ru|xyz|info)\b)/i.test(v);
const collapse = (v: string) => v.replace(/\s+/g, " ").trim();

export const commentSchema = z.object({
  name: z
    .string()
    .transform(collapse)
    .pipe(
      z
        .string()
        .min(2, "Please enter your name")
        .max(60, "Please keep your name under 60 characters"),
    )
    .refine(noLinks, "Please do not include links"),
  message: z
    .string()
    .transform((v) =>
      v
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim(),
    )
    .pipe(
      z.string().min(3, "Please write a few words").max(500, "Please keep it under 500 characters"),
    )
    .refine(noLinks, "Please do not include links"),
});

const rowSchema = z.array(
  z.object({ id: z.string(), name: z.string(), message: z.string(), created_at: z.string() }),
);

export function supabaseConfig(): { url: string; key: string } | null {
  const env = getEnv();
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) return null;
  return { url: env.SUPABASE_URL.replace(/\/$/, ""), key: env.SUPABASE_ANON_KEY };
}

/** Approved comments, newest first. null = not configured or the request failed. */
export async function fetchComments(): Promise<CommentItem[] | null> {
  const cfg = supabaseConfig();
  if (!cfg) return null;
  try {
    const res = await fetch(
      `${cfg.url}/rest/v1/comments?select=id,name,message,created_at&order=created_at.desc&limit=30`,
      {
        headers: { apikey: cfg.key, Authorization: `Bearer ${cfg.key}` },
        next: { revalidate: 120 },
      },
    );
    if (!res.ok) return null;
    return rowSchema.parse(await res.json());
  } catch {
    return null;
  }
}

export async function insertComment(name: string, message: string): Promise<boolean> {
  const cfg = supabaseConfig();
  if (!cfg) return false;
  try {
    const res = await fetch(`${cfg.url}/rest/v1/comments`, {
      method: "POST",
      headers: {
        apikey: cfg.key,
        Authorization: `Bearer ${cfg.key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ name, message }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
