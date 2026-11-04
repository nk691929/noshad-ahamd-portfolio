/**
 * Purpose: the committed manifest must match the real public folders, otherwise new photos/videos would not show on the
 * site. If this fails, run `node scripts/build-media-manifest.mjs` (it also runs on every `pnpm dev` and `pnpm build`)
 * and commit src/generated/media-manifest.json.
 */
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import manifest from "@/generated/media-manifest.json";

const names = (dir: string, exts: string[]) => {
  const full = path.resolve(process.cwd(), "public", dir);
  if (!existsSync(full)) return [];
  return readdirSync(full)
    .filter((f) => exts.includes(f.split(".").pop()?.toLowerCase() ?? ""))
    .sort();
};

describe("media manifest", () => {
  it("lists exactly the files in public/images, public/media and public/audio", () => {
    expect(manifest.images).toEqual(names("images", ["avif", "webp", "jpg", "jpeg", "png"]));
    expect(manifest.media).toEqual(
      names("media", ["avif", "webp", "jpg", "jpeg", "png", "webm", "mp4"]),
    );
    expect(manifest.audio).toEqual(names("audio", ["mp3", "ogg", "m4a", "wav"]));
  });
});
