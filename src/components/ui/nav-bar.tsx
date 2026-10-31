"use client";

/**
 * Purpose: sticky glass navigation with active-section highlight and a full-screen mobile menu.
 * Inputs: brand text, nav items, optional résumé link (all passed from the server Nav; no content imports here).
 * Animated indicator pill is added in step 5. Used by: sections/nav.tsx.
 */
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

type Props = {
  brand: string;
  items: readonly { id: string; label: string }[];
  resumeHref?: string;
  resumeLabel: string;
};

export function NavBar({ brand, items, resumeHref, resumeLabel }: Props) {
  const [active, setActive] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const els = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
      <div className="glass mx-auto flex max-w-6xl items-center justify-between rounded-full px-4 py-2">
        <a href="#top" className="font-display text-lg font-semibold" aria-label="Back to top">
          {brand}
        </a>
        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {items.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  aria-current={active === item.id ? "location" : undefined}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm transition-colors",
                    active === item.id ? "bg-surface-hover text-fg" : "text-fg-muted hover:text-fg",
                  )}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {resumeHref ? (
            <Button
              href={resumeHref}
              variant="secondary"
              external
              className="hidden h-10 px-4 text-sm md:inline-flex"
            >
              {resumeLabel}
            </Button>
          ) : null}
          <button
            type="button"
            className="glass inline-flex h-10 w-10 items-center justify-center rounded-full md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>
      {open ? (
        <div
          id="mobile-menu"
          className="fixed inset-0 -z-10 flex flex-col items-center justify-center gap-6 bg-bg/95 backdrop-blur md:hidden"
        >
          {items.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={() => setOpen(false)}
              className="font-display text-h3"
            >
              {item.label}
            </a>
          ))}
          {resumeHref ? (
            <Button href={resumeHref} variant="secondary" external>
              {resumeLabel}
            </Button>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}
