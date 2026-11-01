/**
 * Purpose: the portfolio is public, so personal phone numbers must never appear in /content. The ONLY allowed
 * phone number is the NexyMark business line, which lives in content/contact.ts (and nowhere else).
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { contactContent } from "@content/contact";

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory() ? files(full) : [full];
  });
}

const contentDir = path.resolve(process.cwd(), "content");
const businessLine = path.join(contentDir, "contact.ts");
const phonePattern = /(\+\d[\d\s-]{8,}\d)|(\b0\d{9,12}\b)|(\b0\d{3}[\s-]\d{3,4}[\s-]\d{3,4}\b)/;

describe("public content privacy", () => {
  it("contains no phone numbers outside content/contact.ts", () => {
    for (const file of files(contentDir).filter((f) => f !== businessLine)) {
      expect(phonePattern.test(readFileSync(file, "utf8")), `phone-like text in ${file}`).toBe(
        false,
      );
    }
  });

  it("shows the business number in a consistent format", () => {
    expect(contactContent.phoneDisplay.replace(/\D/g, "")).toBe(contactContent.phone);
  });
});
