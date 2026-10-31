/**
 * Purpose: the portfolio is public, so content must never contain a phone number.
 * Scans content/ for phone-like patterns. Inputs: content/**. Fails the test run if one is found.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory() ? files(full) : [full];
  });
}

describe("public content privacy", () => {
  it("contains no phone numbers", () => {
    const phone = /(\+\d[\d\s-]{8,}\d)|(\b0\d{3}[\s-]?\d{7}\b)/;
    for (const file of files(path.resolve(process.cwd(), "content"))) {
      expect(phone.test(readFileSync(file, "utf8")), `phone-like text in ${file}`).toBe(false);
    }
  });
});
