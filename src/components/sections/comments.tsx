/**
 * Purpose: Comments section. Shows approved comments from Supabase (refreshed every 2 minutes) and a form to add one.
 * Hidden in production until SUPABASE_URL and SUPABASE_ANON_KEY are set; in development it shows a disabled preview so
 * you can see it. Setup: docs/COMMENTS.md and supabase/comments.sql. Inputs: content/sections.ts. Server component.
 */
import { CommentForm } from "@/components/ui/comment-form";
import { Section } from "@/components/ui/section";
import { fetchComments, supabaseConfig } from "@/lib/comments";
import { sectionsCopy } from "@content/sections";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export async function Comments() {
  const configured = supabaseConfig() !== null;
  if (!configured && process.env.NODE_ENV === "production") return null;

  const copy = sectionsCopy.comments;
  const list = configured ? await fetchComments() : null;

  return (
    <Section id="comments" eyebrow={copy.eyebrow} title={copy.title} intro={copy.intro}>
      <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <CommentForm disabled={!configured} />
        <div>
          {!configured ? (
            <p className="glass rounded-lg p-6 text-fg-muted">{copy.unconfigured}</p>
          ) : list === null ? (
            <p className="glass rounded-lg p-6 text-fg-muted">{copy.unavailable}</p>
          ) : list.length === 0 ? (
            <p className="glass rounded-lg p-6 text-fg-muted">{copy.empty}</p>
          ) : (
            <ol className="flex flex-col gap-4" aria-label={copy.title}>
              {list.map((c) => (
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
          )}
        </div>
      </div>
    </Section>
  );
}
