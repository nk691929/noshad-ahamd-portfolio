/**
 * Purpose: Comments section (server shell). Decides whether the feature is configured and renders the client panel,
 * which loads the comments itself. Hidden in production until Supabase is configured; in development it shows a
 * disabled preview. Setup: docs/COMMENTS.md. Inputs: content/sections.ts, environment variables.
 */
import { CommentsPanel } from "@/components/ui/comments-panel";
import { Section } from "@/components/ui/section";
import { commentsStatus } from "@/lib/comments";
import { sectionsCopy } from "@content/sections";

export function Comments() {
  const { canRead, canPost } = commentsStatus();
  if (!canRead && process.env.NODE_ENV === "production") return null;

  const copy = sectionsCopy.comments;
  return (
    <Section id="comments" eyebrow={copy.eyebrow} title={copy.title} intro={copy.intro}>
      <CommentsPanel canRead={canRead} canPost={canPost} copy={copy} />
    </Section>
  );
}
