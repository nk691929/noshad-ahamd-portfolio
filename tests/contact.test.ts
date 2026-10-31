/**
 * Purpose: contact form schema accepts valid input and rejects bad input.
 */
import { describe, expect, it } from "vitest";
import { contactSchema } from "@/lib/contact";

describe("contactSchema", () => {
  const ok = {
    name: "Ada Lovelace",
    email: "ada@example.com",
    message: "Hello, I have a project.",
  };

  it("accepts valid input", () => {
    expect(contactSchema.safeParse(ok).success).toBe(true);
  });

  it("rejects an invalid email", () => {
    expect(contactSchema.safeParse({ ...ok, email: "nope" }).success).toBe(false);
  });

  it("rejects too-short names and messages", () => {
    expect(contactSchema.safeParse({ ...ok, name: "A" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...ok, message: "short" }).success).toBe(false);
  });
});
