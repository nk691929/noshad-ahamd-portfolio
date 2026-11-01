/**
 * Purpose: GitHub block rendered on the server (no client API key). Shows stats, top languages and recent repos.
 * Falls back to a committed snapshot, then to a plain profile link. Inputs: content/socials.ts, lib/github.ts.
 */
import { Reveal } from "@/components/motion/reveal";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { real } from "@/lib/content/real";
import { getGithubSummary } from "@/lib/github";
import { sectionsCopy } from "@content/sections";
import { socials } from "@content/socials";

function usernameFrom(url: string): string | undefined {
  try {
    return new URL(url).pathname.split("/").filter(Boolean)[0];
  } catch {
    return undefined;
  }
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en", { month: "short", year: "numeric" });
}

export async function GithubActivity() {
  const copy = sectionsCopy.github;
  const url = real(socials.find((s) => s.id === "github")?.url);
  if (!url) return null;
  const username = usernameFrom(url);
  const data = username ? await getGithubSummary(username) : null;

  return (
    <Section id="github" eyebrow={copy.eyebrow} title={copy.title} intro={copy.intro}>
      {data ? (
        <Reveal>
          <div className="grid gap-4 lg:grid-cols-[1fr_1.6fr]">
            <div className="glass rounded-lg p-6">
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-fg-muted">Public repos</dt>
                  <dd className="font-display text-h3">{data.publicRepos}</dd>
                </div>
                <div>
                  <dt className="text-sm text-fg-muted">Followers</dt>
                  <dd className="font-display text-h3">{data.followers}</dd>
                </div>
              </dl>
              {data.languages.length > 0 ? (
                <>
                  <h3 className="mb-3 mt-6 font-display text-lg font-semibold">Top languages</h3>
                  <ul className="flex flex-col gap-3">
                    {data.languages.map((l) => (
                      <li key={l.name}>
                        <div className="flex justify-between text-sm">
                          <span>{l.name}</span>
                          <span className="text-fg-muted">{l.count} repos</span>
                        </div>
                        <div className="mt-1 h-1.5 rounded-full bg-border">
                          <div
                            className="h-full rounded-full bg-accent-grad"
                            style={{
                              width: `${(l.count / (data.languages[0]?.count ?? 1)) * 100}%`,
                            }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
              <Button href={data.profileUrl} variant="secondary" external className="mt-6">
                {copy.viewProfile}
              </Button>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2">
              {data.repos.map((r) => (
                <li key={r.name} className="glass flex flex-col gap-2 rounded-lg p-5">
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-sm text-accent hover:underline"
                  >
                    {r.name}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                  {r.description ? <p className="text-sm text-fg-muted">{r.description}</p> : null}
                  <p className="mt-auto text-xs text-fg-muted">
                    {[
                      r.language,
                      r.stars > 0 ? `${r.stars} stars` : null,
                      formatDate(r.pushedAt) && `Updated ${formatDate(r.pushedAt)}`,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      ) : (
        <Button href={url} variant="secondary" external>
          {copy.viewProfile}
        </Button>
      )}
    </Section>
  );
}
