/**
 * Purpose: find media by filename convention, WITHOUT reading the disk at runtime.
 *   public/media/<project-slug>.(jpg|webp|png|avif)  -> project cover/poster
 *   public/media/<project-slug>.(webm|mp4)           -> looping muted project preview video
 *   public/images/profile.(jpg|webp|png|avif)        -> hero / About portrait
 *   public/audio/ambient.(mp3|ogg|m4a|wav)           -> background music
 * The file lists come from src/generated/media-manifest.json, written at build time by
 * scripts/build-media-manifest.mjs. (On Vercel the public folder is not available to the serverless function that
 * regenerates the page every hour, so a runtime existsSync check made the images disappear after the first refresh.)
 * Used by: lib/projects.ts, hero, about, lib/seo.ts, page.tsx.
 */
import manifest from "@/generated/media-manifest.json";

export const IMAGE_EXTENSIONS = ["avif", "webp", "jpg", "jpeg", "png"] as const;
export const VIDEO_EXTENSIONS = ["webm", "mp4"] as const;
export const AUDIO_EXTENSIONS = ["mp3", "ogg", "m4a", "wav"] as const;

function fromList(
  files: readonly string[],
  publicBase: string,
  name: string,
  extensions: readonly string[],
): string | undefined {
  for (const ext of extensions) {
    const file = `${name}.${ext}`;
    if (files.includes(file)) return `${publicBase}/${file}`;
  }
  return undefined;
}

export function projectMedia(slug: string): { cover?: string; video?: string } {
  const cover = fromList(manifest.media, "/media", slug, IMAGE_EXTENSIONS);
  const video = fromList(manifest.media, "/media", slug, VIDEO_EXTENSIONS);
  return { ...(cover ? { cover } : {}), ...(video ? { video } : {}) };
}

export function profilePhoto(): string | undefined {
  return fromList(manifest.images, "/images", "profile", IMAGE_EXTENSIONS);
}

export function ambientAudio(): string | undefined {
  return fromList(manifest.audio, "/audio", "ambient", AUDIO_EXTENSIONS);
}
