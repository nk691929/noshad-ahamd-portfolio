/**
 * Purpose: summarize() excludes forks, counts languages and sorts repos by recent push.
 */
import { describe, expect, it } from "vitest";
import { summarize, type GithubRaw } from "@/lib/github";

const repo = (name: string, language: string | null, fork: boolean, pushed: string) => ({
  name,
  description: null,
  html_url: `https://github.com/x/${name}`,
  language,
  stargazers_count: 0,
  fork,
  archived: false,
  pushed_at: pushed,
});

describe("summarize", () => {
  const raw: GithubRaw = {
    user: { login: "x", html_url: "https://github.com/x", public_repos: 4, followers: 1 },
    repos: [
      repo("a", "Dart", false, "2026-01-01T00:00:00Z"),
      repo("b", "Dart", false, "2026-03-01T00:00:00Z"),
      repo("c", "TypeScript", false, "2026-02-01T00:00:00Z"),
      repo("forked", "Python", true, "2026-04-01T00:00:00Z"),
    ],
  };

  it("ignores forks and ranks languages", () => {
    const s = summarize(raw);
    expect(s.languages[0]).toEqual({ name: "Dart", count: 2 });
    expect(s.languages.some((l) => l.name === "Python")).toBe(false);
  });

  it("orders repos by latest push", () => {
    expect(summarize(raw).repos.map((r) => r.name)).toEqual(["b", "c", "a"]);
  });
});
