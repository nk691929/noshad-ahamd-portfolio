/**
 * Purpose: GitHub activity data for the GitHub section. Server only (uses an optional GITHUB_TOKEN).
 * Flow: live API (revalidated hourly) -> committed snapshot data/github-snapshot.json -> null.
 * Used by: github-activity.tsx, scripts/github-snapshot.mjs (writes the snapshot), tests.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { getEnv } from "./env";

const userSchema = z.object({
  login: z.string(),
  html_url: z.string(),
  public_repos: z.number(),
  followers: z.number(),
});
const repoSchema = z.object({
  name: z.string(),
  description: z.string().nullable(),
  html_url: z.string(),
  language: z.string().nullable(),
  stargazers_count: z.number(),
  fork: z.boolean(),
  archived: z.boolean(),
  pushed_at: z.string().nullable(),
});
const rawSchema = z.object({ user: userSchema, repos: z.array(repoSchema) });

export type GithubRaw = z.infer<typeof rawSchema>;

export type GithubSummary = {
  username: string;
  profileUrl: string;
  publicRepos: number;
  followers: number;
  languages: { name: string; count: number }[];
  repos: {
    name: string;
    description: string | null;
    url: string;
    language: string | null;
    stars: number;
    pushedAt: string | null;
  }[];
};

export function summarize(raw: GithubRaw): GithubSummary {
  const own = raw.repos.filter((r) => !r.fork);
  const counts = new Map<string, number>();
  for (const r of own) if (r.language) counts.set(r.language, (counts.get(r.language) ?? 0) + 1);
  const languages = [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, 5);
  const repos = [...own]
    .sort((a, b) => (b.pushed_at ?? "").localeCompare(a.pushed_at ?? ""))
    .slice(0, 6)
    .map((r) => ({
      name: r.name,
      description: r.description,
      url: r.html_url,
      language: r.language,
      stars: r.stargazers_count,
      pushedAt: r.pushed_at,
    }));
  return {
    username: raw.user.login,
    profileUrl: raw.user.html_url,
    publicRepos: raw.user.public_repos,
    followers: raw.user.followers,
    languages,
    repos,
  };
}

async function fetchLive(username: string): Promise<GithubRaw> {
  let token: string | undefined;
  try {
    token = getEnv().GITHUB_TOKEN;
  } catch {
    token = undefined;
  }
  const init = {
    headers: {
      Accept: "application/vnd.github+json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    next: { revalidate: 3600 },
  };
  const [u, r] = await Promise.all([
    fetch(`https://api.github.com/users/${username}`, init),
    fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`, init),
  ]);
  if (!u.ok || !r.ok) throw new Error(`GitHub API error ${u.status}/${r.status}`);
  return rawSchema.parse({ user: await u.json(), repos: await r.json() });
}

async function readSnapshot(): Promise<GithubRaw> {
  const file = path.join(process.cwd(), "data", "github-snapshot.json");
  return rawSchema.parse(JSON.parse(await fs.readFile(file, "utf8")));
}

export async function getGithubSummary(username: string): Promise<GithubSummary | null> {
  try {
    return summarize(await fetchLive(username));
  } catch {
    try {
      return summarize(await readSnapshot());
    } catch {
      return null;
    }
  }
}
