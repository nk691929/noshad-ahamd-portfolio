/**
 * Purpose: comment validation: sensible lengths, whitespace cleaned, links rejected (spam), clear messages.
 */
import { describe, expect, it } from "vitest";
import { commentSchema } from "@/lib/comments";

describe("commentSchema", () => {
  it("accepts a normal comment and tidies whitespace", () => {
    const r = commentSchema.safeParse({
      name: "  Ada   Lovelace ",
      message: "Great   portfolio!\n\n\n\nThanks.",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.name).toBe("Ada Lovelace");
      expect(r.data.message).toBe("Great portfolio!\n\nThanks.");
    }
  });

  it("rejects links in the name or message", () => {
    expect(
      commentSchema.safeParse({ name: "Ada", message: "see https://spam.example" }).success,
    ).toBe(false);
    expect(
      commentSchema.safeParse({ name: "Ada", message: "visit www.spam.test now" }).success,
    ).toBe(false);
    expect(commentSchema.safeParse({ name: "buy.com", message: "hello there" }).success).toBe(
      false,
    );
  });

  it("enforces lengths", () => {
    expect(commentSchema.safeParse({ name: "A", message: "hello there" }).success).toBe(false);
    expect(commentSchema.safeParse({ name: "Ada", message: "hi" }).success).toBe(false);
    expect(commentSchema.safeParse({ name: "Ada", message: "x".repeat(501) }).success).toBe(false);
  });
});
