/**
 * Purpose: media discovery by filename convention picks the preferred extension and ignores missing files.
 */
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { findFile, IMAGE_EXTENSIONS, VIDEO_EXTENSIONS } from "@/lib/media";

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
