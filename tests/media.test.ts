/**
 * Purpose: media discovery. (1) The file-system finder picks the preferred extension and ignores missing files.
 * (2) The runtime helpers resolve from the manifest by filename convention.
 */
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import {
  AUDIO_EXTENSIONS,
  IMAGE_EXTENSIONS,
  VIDEO_EXTENSIONS,
  ambientAudio,
  profilePhoto,
  projectMedia,
} from "@/lib/media";
import { findFile } from "@/lib/media-fs";

const dir = mkdtempSync(path.join(os.tmpdir(), "media-"));
afterAll(() => rmSync(dir, { recursive: true, force: true }));

describe("findFile", () => {
  it("returns undefined when nothing matches", () => {
    expect(findFile(dir, "/media", "none", IMAGE_EXTENSIONS)).toBeUndefined();
  });

  it("prefers modern image formats", () => {
    writeFileSync(path.join(dir, "demo.jpg"), "x");
    writeFileSync(path.join(dir, "demo.webp"), "x");
    expect(findFile(dir, "/media", "demo", IMAGE_EXTENSIONS)).toBe("/media/demo.webp");
  });

  it("finds videos separately from images", () => {
    writeFileSync(path.join(dir, "clip.mp4"), "x");
    expect(findFile(dir, "/media", "clip", VIDEO_EXTENSIONS)).toBe("/media/clip.mp4");
    expect(findFile(dir, "/media", "clip", IMAGE_EXTENSIONS)).toBeUndefined();
  });
});

describe("manifest helpers", () => {
  it("return public URLs or undefined, never throw", () => {
    expect(projectMedia("definitely-not-a-project")).toEqual({});
    const photo = profilePhoto();
    if (photo) expect(photo).toMatch(/^\/images\/profile\.(avif|webp|jpg|jpeg|png)$/);
    const audio = ambientAudio();
    if (audio)
      expect(audio).toMatch(new RegExp(`^/audio/ambient\\.(${AUDIO_EXTENSIONS.join("|")})$`));
  });
});
