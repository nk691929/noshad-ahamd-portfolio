/**
 * Purpose: the generated background-music chords are well formed (four notes each, in a warm pad range).
 */
import { describe, expect, it } from "vitest";
import { CHORDS } from "@/lib/ambient";

describe("ambient chords", () => {
  it("has four chords of four notes in a low pad range", () => {
    expect(CHORDS).toHaveLength(4);
    for (const chord of CHORDS) {
      expect(chord).toHaveLength(4);
      for (const hz of chord) {
        expect(hz).toBeGreaterThan(80);
        expect(hz).toBeLessThan(400);
      }
    }
  });
});
