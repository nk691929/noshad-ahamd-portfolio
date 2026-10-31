// Purpose: save a GitHub snapshot to data/github-snapshot.json, used as a fallback when the API is unavailable.
// Run: pnpm github:snapshot [username]  (optional GITHUB_TOKEN env var raises rate limits).
import { mkdirSync, writeFileSync } from "node:fs";

const username = process.argv[2] ?? "nk691929";
const headers = {
  Accept: "application/vnd.github+json",
  ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
};

const [u, r] = await Promise.all([
  fetch(`https://api.github.com/users/${username}`, { headers }),
  fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`, { headers }),
]);
if (!u.ok || !r.ok) {
  console.error(`GitHub API error: ${u.status} / ${r.status}`);
  process.exit(1);
}
mkdirSync("data", { recursive: true });
writeFileSync(
  "data/github-snapshot.json",
  JSON.stringify({ user: await u.json(), repos: await r.json() }, null, 2),
);
console.log("Wrote data/github-snapshot.json");
