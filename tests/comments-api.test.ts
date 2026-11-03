/**
 * Purpose: query-string parsing for the comments API (cursor and page size) and the visitor hash.
 */
import { describe, expect, it } from "vitest";
import {
  COMMENT_MAX_PAGE,
  COMMENT_PAGE_SIZE,
  UUID,
  hashIp,
  parseBefore,
  parseLimit,
} from "@/lib/comments";

describe("parseBefore", () => {
  it("accepts ISO timestamps and rejects everything else", () => {
    expect(parseBefore("2026-11-03T10:00:00.123456+00:00")).toBe(
      "2026-11-03T10:00:00.123456+00:00",
    );
    expect(parseBefore("2026-11-03T10:00:00Z")).toBe("2026-11-03T10:00:00Z");
    expect(parseBefore(null)).toBeNull();
    expect(parseBefore("yesterday")).toBeNull();
    expect(parseBefore("2026-11-03T10:00:00Z&approved=eq.false")).toBeNull();
  });
});

describe("parseLimit", () => {
  it("defaults, clamps and ignores junk", () => {
    expect(parseLimit(null)).toBe(COMMENT_PAGE_SIZE);
    expect(parseLimit("abc")).toBe(COMMENT_PAGE_SIZE);
    expect(parseLimit("0")).toBe(COMMENT_PAGE_SIZE);
    expect(parseLimit("5")).toBe(5);
    expect(parseLimit("9999")).toBe(COMMENT_MAX_PAGE);
  });
});

describe("submission ids and visitor hashes", () => {
  it("recognises UUIDs", () => {
    expect(UUID.test("3f2b8a52-6d1e-4c8b-9a77-1f2e3d4c5b6a")).toBe(true);
    expect(UUID.test("not-a-uuid")).toBe(false);
  });

  it("hashes deterministically without revealing the IP", () => {
    const a = hashIp("203.0.113.9", "secret");
    expect(a).toBe(hashIp("203.0.113.9", "secret"));
    expect(a).not.toContain("203");
    expect(a).not.toBe(hashIp("203.0.113.10", "secret"));
    expect(a).toHaveLength(32);
  });
});
