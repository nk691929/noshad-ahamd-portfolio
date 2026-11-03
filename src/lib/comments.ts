/**
 * Purpose: comment validation and the Supabase reads/writes. Server only.
 *  - READ  (public API, publishable key): approved comments only, newest first, keyset pagination. RLS enforces it.
 *  - WRITE (server action, secret key): validated, rate limited, de-duplicated, stored with approved=true unless
 *    COMMENTS_REQUIRE_APPROVAL=true. Visitors can never write to the table directly (see supabase/migrations).
 * Used by: app/api/comments/route.ts, app/actions/comments.ts, sections/comments.tsx, tests.
 */
import { createHash } from "node:crypto";
import { z } from "zod";
import type { CommentItem } from "@/lib/comments-types";
import { logSupabaseFailure, supabaseConfig, supabaseRest } from "@/lib/supabase/server";

export const COMMENT_PAGE_SIZE = 12;
export const COMMENT_MAX_PAGE = 30;
/** at most this many comments per visitor (hashed IP) in the window */
export const RATE_LIMIT = { count: 3, minutes: 10 };

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

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ISO = /^\d{4}-\d{2}-\d{2}T[\d:.]+(Z|[+-]\d{2}:?\d{2})?$/;

/** Cursor for "older than": only accepts an ISO timestamp. */
export function parseBefore(value: string | null): string | null {
  if (!value || !ISO.test(value) || Number.isNaN(Date.parse(value))) return null;
  return value;
}

export function parseLimit(value: string | null): number {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1) return COMMENT_PAGE_SIZE;
  return Math.min(n, COMMENT_MAX_PAGE);
}

export function hashIp(ip: string, secret: string): string {
  return createHash("sha256").update(`${ip}:${secret}`).digest("hex").slice(0, 32);
}

export function commentsStatus(): { canRead: boolean; canPost: boolean } {
  const cfg = supabaseConfig();
  return { canRead: cfg !== null, canPost: Boolean(cfg?.secretKey) };
}

export function approvalRequired(): boolean {
  return process.env.COMMENTS_REQUIRE_APPROVAL === "true";
}

const rowSchema = z.array(
  z.object({ id: z.string(), name: z.string(), message: z.string(), created_at: z.string() }),
);

/** One page of approved comments, or null if Supabase is unavailable. */
export async function listComments(
  before: string | null,
  limit: number,
): Promise<{ items: CommentItem[]; nextBefore: string | null } | null> {
  const cursor = before ? `&created_at=lt.${encodeURIComponent(before)}` : "";
  const res = await supabaseRest(
    `comments?select=id,name,message,created_at&approved=eq.true&order=created_at.desc&limit=${limit + 1}${cursor}`,
    { role: "public" },
  );
  if (!res) return null;
  if (!res.ok) {
    await logSupabaseFailure("list comments", res);
    return null;
  }
  try {
    const rows = rowSchema.parse(await res.json());
    const items = rows.slice(0, limit);
    const last = items[items.length - 1];
    return { items, nextBefore: rows.length > limit && last ? last.created_at : null };
  } catch {
    console.error("[comments] unexpected response shape from Supabase");
    return null;
  }
}

/** How many comments this visitor posted recently; null if the check could not run. */
export async function countRecentFromVisitor(ipHash: string): Promise<number | null> {
  const since = new Date(Date.now() - RATE_LIMIT.minutes * 60_000).toISOString();
  const res = await supabaseRest(
    `comments?select=id&ip_hash=eq.${ipHash}&created_at=gte.${encodeURIComponent(since)}&limit=${RATE_LIMIT.count + 1}`,
    { role: "secret" },
  );
  if (!res) return null;
  if (!res.ok) {
    await logSupabaseFailure("rate limit lookup", res);
    return null;
  }
  try {
    return z.array(z.object({ id: z.string() })).parse(await res.json()).length;
  } catch {
    return null;
  }
}

export type CreateResult =
  { status: "ok"; comment: CommentItem } | { status: "duplicate" } | { status: "error" };

export async function createComment(input: {
  name: string;
  message: string;
  submissionId: string;
  ipHash: string;
  approved: boolean;
}): Promise<CreateResult> {
  const res = await supabaseRest("comments?select=id,name,message,created_at", {
    role: "secret",
    method: "POST",
    prefer: "return=representation",
    body: {
      name: input.name,
      message: input.message,
      approved: input.approved,
      ip_hash: input.ipHash,
      submission_id: input.submissionId,
    },
  });
  if (!res) return { status: "error" };
  if (res.status === 409) return { status: "duplicate" }; // same submission_id: a double click or a retry
  if (!res.ok) {
    await logSupabaseFailure("insert comment", res);
    return { status: "error" };
  }
  try {
    const [comment] = rowSchema.parse(await res.json());
    return comment ? { status: "ok", comment } : { status: "error" };
  } catch {
    return { status: "error" };
  }
}
