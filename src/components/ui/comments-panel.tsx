"use client";

/**
 * Purpose: the comments form and list. The list is fetched from /api/comments when the section nears the viewport
 * (so it adds nothing to the initial page load), paginated with "Load more", and refetched on every visit, so comments
 * persist across refreshes. A comment you post is shown at once (the server returns the stored row) and is de-duplicated
 * against the fetched list by id. Each form render uses one submission id, so a double tap or retry cannot create two rows.
 * Inputs: canRead / canPost flags and copy from content/sections.ts. Used by: sections/comments.tsx.
 */
import { useActionState, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { submitComment } from "@/app/actions/comments";
import { buttonClasses } from "@/components/ui/button";
import type { CommentItem, CommentState } from "@/lib/comments-types";

type Copy = {
  empty: string;
  unavailable: string;
  unconfigured: string;
  notPostable: string;
  loading: string;
  retry: string;
  loadMore: string;
  title: string;
};

type ListState = {
  items: CommentItem[];
  nextBefore: string | null;
  status: "idle" | "loading" | "ready" | "error";
};

const initialState: CommentState = { status: "idle" };
const inputClass =
  "w-full rounded-md border border-border bg-bg-elevated px-4 py-3 text-fg placeholder:text-fg-muted aria-[invalid=true]:border-accent disabled:opacity-60";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" });

export function CommentsPanel({
  canRead,
  canPost,
  copy,
}: {
  canRead: boolean;
  canPost: boolean;
  copy: Copy;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const submissionId = useRef<string | null>(null);
  const [list, setList] = useState<ListState>({ items: [], nextBefore: null, status: "idle" });
  const [posted, setPosted] = useState<CommentItem[]>([]);

  const load = useCallback(async (before: string | null, signal?: AbortSignal) => {
    setList((l) => ({ ...l, status: "loading" }));
    try {
      const res = await fetch(
        `/api/comments${before ? `?before=${encodeURIComponent(before)}` : ""}`,
        {
          cache: "no-store",
          ...(signal ? { signal } : {}),
        },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { items: CommentItem[]; nextBefore: string | null };
      setList((l) => ({
        items: before ? [...l.items, ...data.items] : data.items,
        nextBefore: data.nextBefore,
        status: "ready",
      }));
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setList((l) => ({ ...l, status: "error" }));
    }
  }, []);

  // Fetch when the section is about to be seen (not during the initial page load).
  useEffect(() => {
    const el = sectionRef.current;
    if (!canRead || !el) return;
    const controller = new AbortController();
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          observer.disconnect();
          void load(null, controller.signal);
        }
      },
      { rootMargin: "400px" },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      controller.abort();
    };
  }, [canRead, load]);

  async function action(prev: CommentState, formData: FormData): Promise<CommentState> {
    submissionId.current ??= crypto.randomUUID();
    formData.set("submission_id", submissionId.current);
    const result = await submitComment(prev, formData);
    if (result.status === "success") {
      submissionId.current = null; // the next comment gets a new id
      const stored = result.comment;
      if (stored) setPosted((p) => [stored, ...p]);
    }
    return result;
  }

  const [state, formAction, pending] = useActionState(action, initialState);
  const nameError = state.fieldErrors?.name;
  const messageError = state.fieldErrors?.message;

  const shown = useMemo(() => {
    const seen = new Set<string>();
    return [...posted, ...list.items].filter((c) =>
      seen.has(c.id) ? false : (seen.add(c.id), true),
    );
  }, [posted, list.items]);

  const formDisabled = !canPost;

  return (
    <div ref={sectionRef} className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
      <form
        action={formAction}
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
            disabled={formDisabled}
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
            disabled={formDisabled}
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
          disabled={formDisabled || pending}
          className={buttonClasses("primary", "self-start disabled:opacity-60")}
        >
          {pending ? "Posting..." : "Post comment"}
        </button>
        <div aria-live="polite" className="min-h-6 text-sm">
          {formDisabled ? (
            <p className="text-fg-muted">{canRead ? copy.notPostable : copy.unconfigured}</p>
          ) : state.message ? (
            <p className={state.status === "success" ? "text-fg" : "text-fg-muted"}>
              {state.message}
            </p>
          ) : null}
        </div>
      </form>

      <div>
        {!canRead ? (
          <p className="glass rounded-lg p-6 text-fg-muted">{copy.unconfigured}</p>
        ) : list.status === "error" && shown.length === 0 ? (
          <div className="glass flex flex-col items-start gap-4 rounded-lg p-6 text-fg-muted">
            <p>{copy.unavailable}</p>
            <button
              type="button"
              onClick={() => void load(null)}
              className={buttonClasses("secondary", "h-10 px-4 text-sm")}
            >
              {copy.retry}
            </button>
          </div>
        ) : list.status !== "ready" && shown.length === 0 ? (
          <p className="glass rounded-lg p-6 text-fg-muted" aria-live="polite">
            {copy.loading}
          </p>
        ) : shown.length === 0 ? (
          <p className="glass rounded-lg p-6 text-fg-muted">{copy.empty}</p>
        ) : (
          <>
            <ol className="flex flex-col gap-4" aria-label={copy.title}>
              {shown.map((c) => (
                <li key={c.id} className="glass rounded-lg p-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-display text-lg font-semibold">{c.name}</p>
                    <time dateTime={c.created_at} className="font-mono text-xs text-fg-muted">
                      {formatDate(c.created_at)}
                    </time>
                  </div>
                  <p className="mt-2 whitespace-pre-line text-fg-muted">{c.message}</p>
                </li>
              ))}
            </ol>
            {list.nextBefore ? (
              <button
                type="button"
                disabled={list.status === "loading"}
                onClick={() => void load(list.nextBefore)}
                className={buttonClasses("secondary", "mt-4 disabled:opacity-60")}
              >
                {list.status === "loading" ? copy.loading : copy.loadMore}
              </button>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
