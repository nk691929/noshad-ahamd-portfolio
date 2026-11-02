/**
 * Purpose: find media files by filename convention, so the owner never edits content to add photos or videos.
 *   public/media/<project-slug>.(jpg|webp|png|avif)  -> project cover/poster
 *   public/media/<project-slug>.(webm|mp4)           -> looping muted project preview video
 *   public/images/profile.(jpg|webp|png|avif)        -> hero portrait
 * Server only (reads the filesystem at build/revalidate time). Used by: lib/projects.ts, hero, tests.
 */
import fs from "node:fs";
import path from "node:path";

export const IMAGE_EXTENSIONS = ["avif", "webp", "jpg", "jpeg", "png"] as const;
export const VIDEO_EXTENSIONS = ["webm", "mp4"] as const;

export function findFile(
  dir: string,
  publicBase: string,
  name: string,
  extensions: readonly string[],
): string | undefined {
  for (const ext of extensions) {
    // The turbopackIgnore comments stop the bundler from tracing the whole project into the server build.
    if (
      fs.existsSync(
        /*turbopackIgnore: true*/ path.join(/*turbopackIgnore: true*/ dir, `${name}.${ext}`),
      )
    ) {
      return `${publicBase}/${name}.${ext}`;
    }
  }
  return undefined;
}

const publicDir = (...parts: string[]) =>
  path.join(/*turbopackIgnore: true*/ process.cwd(), "public", ...parts);

export function projectMedia(slug: string): { cover?: string; video?: string } {
  const cover = findFile(publicDir("media"), "/media", slug, IMAGE_EXTENSIONS);
  const video = findFile(publicDir("media"), "/media", slug, VIDEO_EXTENSIONS);
  return { ...(cover ? { cover } : {}), ...(video ? { video } : {}) };
}

export function profilePhoto(): string | undefined {
  return findFile(publicDir("images"), "/images", "profile", IMAGE_EXTENSIONS);
}
