/**
 * Purpose: footer with profile links (with GitHub / LinkedIn logos) and the site version read from package.json.
 * Inputs: content/profile.ts, content/socials.ts, package.json.
 */
import { SocialIcon } from "@/components/ui/social-icon";
import { real } from "@/lib/content/real";
import { profile } from "@content/profile";
import { socials } from "@content/socials";
import pkg from "../../../package.json";

export function Footer() {
  const links = socials.map((s) => ({ ...s, url: real(s.url) })).filter((s) => s.url);
  return (
    <footer className="border-t border-border py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 text-sm text-fg-muted">
        <p>
          © {new Date().getFullYear()} {profile.name}
        </p>
        <ul className="flex gap-5">
          {links.map((s) => (
            <li key={s.id}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:text-fg"
              >
                <SocialIcon id={s.id} className="h-4 w-4" />
                {s.label}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="font-mono">v{pkg.version}</p>
      </div>
    </footer>
  );
}
