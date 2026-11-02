"use server";

/**
 * Purpose: server action for the comment form. Validates (no links, length limits), blocks bots (honeypot) and rapid
 * repeats (a 60 second cookie), then stores the comment UNAPPROVED in Supabase. Supabase keys never reach the browser.
 * Used by: components/ui/comment-form.tsx.
 */
import { cookies } from "next/headers";
import { commentSchema, insertComment, supabaseConfig } from "@/lib/comments";
import type { CommentField, CommentState } from "@/lib/comments-types";

export async function submitComment(
  _prev: CommentState,
  formData: FormData,
): Promise<CommentState> {
  if (String(formData.get("website") ?? "") !== "")
    return { status: "success", message: "Thanks!" };

  const values = {
    name: String(formData.get("name") ?? ""),
    message: String(formData.get("message") ?? ""),
  };

  if (!supabaseConfig())
    return { status: "error", message: "Comments are not switched on yet.", values };

  const jar = await cookies();
  if (jar.get("cmt")) {
    return {
      status: "error",
      message: "Please wait a minute before posting another comment.",
      values,
    };
  }

  const parsed = commentSchema.safeParse(values);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<CommentField, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as CommentField | undefined;
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { status: "error", message: "Please fix the highlighted fields.", fieldErrors, values };
  }

  const ok = await insertComment(parsed.data.name, parsed.data.message);
  if (!ok)
    return {
      status: "error",
      message: "Sorry, your comment could not be saved. Please try again later.",
      values,
    };

  jar.set("cmt", "1", { maxAge: 60, httpOnly: true, sameSite: "lax", path: "/" });
  return { status: "success", message: "Thanks! Your comment will appear after a quick review." };
}
