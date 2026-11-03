"use server";

/**
 * Purpose: server action that stores a visitor comment. Order of checks: honeypot, configuration, cooldown cookie,
 * validation (length, no links, submission id), per-visitor rate limit, then the insert. The insert uses the Supabase
 * SECRET key, which exists only here on the server. A repeated submission id (double tap, retry) is treated as success
 * and never creates a second row. Returns the stored comment so the page can show it immediately.
 * Used by: components/ui/comments-panel.tsx.
 */
import { cookies, headers } from "next/headers";
import {
  RATE_LIMIT,
  UUID,
  approvalRequired,
  commentSchema,
  countRecentFromVisitor,
  createComment,
  hashIp,
} from "@/lib/comments";
import type { CommentField, CommentState } from "@/lib/comments-types";
import { supabaseConfig } from "@/lib/supabase/server";

export async function submitComment(
  _prev: CommentState,
  formData: FormData,
): Promise<CommentState> {
  // Honeypot: people never see this field; bots fill it. Pretend success so they learn nothing.
  if (String(formData.get("website") ?? "") !== "")
    return { status: "success", message: "Thanks!" };

  const values = {
    name: String(formData.get("name") ?? ""),
    message: String(formData.get("message") ?? ""),
  };
  const submissionId = String(formData.get("submission_id") ?? "");

  const cfg = supabaseConfig();
  if (!cfg?.secretKey)
    return { status: "error", message: "Posting comments is not switched on yet.", values };

  const jar = await cookies();
  if (jar.get("cmt")) {
    return {
      status: "error",
      message: "Please wait a few seconds before posting another comment.",
      values,
    };
  }

  const parsed = commentSchema.safeParse(values);
  if (!parsed.success || !UUID.test(submissionId)) {
    const fieldErrors: Partial<Record<CommentField, string>> = {};
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as CommentField | undefined;
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
    }
    return { status: "error", message: "Please fix the highlighted fields.", fieldErrors, values };
  }

  const h = await headers();
  const ip =
    (h.get("x-forwarded-for") ?? "").split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  const ipHash = hashIp(ip, cfg.secretKey);

  const recent = await countRecentFromVisitor(ipHash);
  if (recent === null) {
    return {
      status: "error",
      message: "Comments are temporarily unavailable. Please try again later.",
      values,
    };
  }
  if (recent >= RATE_LIMIT.count) {
    return {
      status: "error",
      message: "You have posted a few comments already. Please try again in a little while.",
      values,
    };
  }

  const approved = !approvalRequired();
  const result = await createComment({ ...parsed.data, submissionId, ipHash, approved });

  if (result.status === "error") {
    return {
      status: "error",
      message: "Sorry, your comment could not be saved. Please try again.",
      values,
    };
  }

  jar.set("cmt", "1", { maxAge: 30, httpOnly: true, sameSite: "lax", path: "/" });

  if (result.status === "duplicate")
    return { status: "success", message: "Thanks! Your comment was already received." };
  if (!approved)
    return { status: "success", message: "Thanks! Your comment will appear after a quick review." };
  return { status: "success", message: "Thanks! Your comment is posted.", comment: result.comment };
}
