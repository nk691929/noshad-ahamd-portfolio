// Purpose: list the files in public/media, public/images and public/audio into src/generated/media-manifest.json.
// Why: the site discovers portraits, project screenshots/videos and the music track by filename. Reading the disk at
// RUNTIME is unreliable on Vercel (the public folder is not part of the serverless function that regenerates the page),
// so the list is written at BUILD time and imported as plain JSON instead.
// Runs automatically before `pnpm dev` and `pnpm build`. Commit the generated file.
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const EXT = {
  images: ["avif", "webp", "jpg", "jpeg", "png"],
  media: ["avif", "webp", "jpg", "jpeg", "png", "webm", "mp4"],
  audio: ["mp3", "ogg", "m4a", "wav"],
};

const list = (dir, exts) => {
  const full = path.resolve("public", dir);
  if (!existsSync(full)) return [];
  return readdirSync(full, { withFileTypes: true })
    .filter((e) => e.isFile() && exts.includes(e.name.split(".").pop()?.toLowerCase() ?? ""))
    .map((e) => e.name)
    .sort();
};

const manifest = {
  images: list("images", EXT.images),
  media: list("media", EXT.media),
  audio: list("audio", EXT.audio),
};

const out = path.resolve("src", "generated", "media-manifest.json");
mkdirSync(path.dirname(out), { recursive: true });
writeFileSync(out, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(
  `media manifest: ${manifest.images.length} images, ${manifest.media.length} project media, ${manifest.audio.length} audio`,
);
