"use client";

/**
 * Purpose: visitor comment form wired to the submitComment server action. Comments go to Supabase unapproved and show
 * after review. Honeypot field + server-side limits protect against spam. Inputs: disabled (Supabase not connected yet).
 * Used by: sections/comments.tsx.
 */
import { useActionState } from "react";
import { submitComment } from "@/app/actions/comments";
import { buttonClasses } from "@/components/ui/button";
import type { CommentState } from "@/lib/comments-types";

const initial: CommentState = { status: "idle" };
const inputClass =
  "w-full rounded-md border border-border bg-bg-elevated px-4 py-3 text-fg placeholder:text-fg-muted aria-[invalid=true]:border-accent disabled:opacity-60";

export function CommentForm({ disabled }: { disabled: boolean }) {
  const [state, action, pending] = useActionState(submitComment, initial);
  const nameError = state.fieldErrors?.name;
  const messageError = state.fieldErrors?.message;

  return (
    <form
      action={action}
      className="glass relative flex flex-col gap-5 rounded-lg p-6 md:p-8"
      noValidate
    >
      <span className="ring" aria-hidden="true" />
      <div className="flex flex-col gap-2">
        <label htmlFor="comment-name" className="text-sm text-fg-muted">
          Your name
        </label>
        <input
          id="comment-name"
          name="name"
          required
          minLength={2}
          maxLength={60}
          autoComplete="name"
          disabled={disabled}
          defaultValue={state.values?.name}
          aria-invalid={nameError ? true : undefined}
          aria-describedby={nameError ? "comment-name-error" : undefined}
          className={inputClass}
        />
        {nameError ? (
          <p id="comment-name-error" className="text-sm text-accent">
            {nameError}
          </p>
        ) : null}
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="comment-message" className="text-sm text-fg-muted">
          Comment
        </label>
        <textarea
          id="comment-message"
          name="message"
          required
          rows={4}
          minLength={3}
          maxLength={500}
          disabled={disabled}
          defaultValue={state.values?.message}
          aria-invalid={messageError ? true : undefined}
          aria-describedby={messageError ? "comment-message-error" : undefined}
          className={inputClass}
        />
        {messageError ? (
          <p id="comment-message-error" className="text-sm text-accent">
            {messageError}
          </p>
        ) : null}
      </div>
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <button
        type="submit"
        disabled={disabled || pending}
        className={buttonClasses("primary", "self-start disabled:opacity-60")}
      >
        {pending ? "Posting..." : "Post comment"}
      </button>
      <div aria-live="polite" className="min-h-6 text-sm">
        {state.message ? (
          <p className={state.status === "success" ? "text-fg" : "text-fg-muted"}>
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
