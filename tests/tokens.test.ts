/**
 * Purpose: guard WCAG AA contrast (>= 4.5:1) for key text/background token pairs in both themes.
 * Reads src/styles/tokens.css directly so the test can never drift from the real tokens.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(path.resolve(process.cwd(), "src/styles/tokens.css"), "utf8");

function block(selector: string): string {
  const start = css.indexOf(selector);
  if (start === -1) throw new Error(`Selector not found: ${selector}`);
  return css.slice(start, css.indexOf("}", start));
}

function hex(scope: string, name: string, fallbackScope?: string): string {
  const re = new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`);
  const m = re.exec(scope) ?? (fallbackScope ? re.exec(fallbackScope) : null);
  if (!m?.[1]) throw new Error(`Token --${name} not found as a hex value`);
  return m[1];
}

function luminance(h: string): number {
  const ch = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const [r, g, b] = ch.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)) as [
    number,
    number,
    number,
  ];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

const themes = {
  dark: block(":root {"),
  light: block(':root[data-theme="light"]'),
};

describe.each(Object.entries(themes))("%s theme contrast (AA)", (_name, scope) => {
  const get = (n: string) => hex(scope, n, themes.dark);
  const bg = get("bg");

  it.each(["fg", "fg-muted", "accent-text"])("--%s on --bg >= 4.5", (token) => {
    expect(contrast(get(token), bg)).toBeGreaterThanOrEqual(4.5);
  });

  it("--fg-muted on --bg-elevated >= 4.5", () => {
    expect(contrast(get("fg-muted"), get("bg-elevated"))).toBeGreaterThanOrEqual(4.5);
  });
});
