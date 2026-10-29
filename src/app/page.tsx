/**
 * Purpose: TEMPORARY token preview page used to eyeball the design system in both themes.
 * Replaced by the real sections in step 4. Used by: route "/".
 */
import { ThemeToggle } from "@/components/ui/theme-toggle";

const swatches = [
  ["bg", "bg-bg"],
  ["bg-elevated", "bg-bg-elevated"],
  ["surface", "bg-surface"],
  ["accent-1", "bg-accent-1"],
  ["accent-2", "bg-accent-2"],
  ["gradient", "bg-accent-grad"],
] as const;

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-12 px-6 py-16">
      <header className="flex items-center justify-between">
        <span className="font-mono text-sm text-fg-muted">tokens / preview</span>
        <ThemeToggle />
      </header>

      <section className="flex flex-col gap-4">
        <h1 className="font-display text-hero">
          Noshad <span className="text-gradient">Ahmad</span>
        </h1>
        <p className="max-w-xl text-lg text-fg-muted">
          Design tokens, fluid type, glass surfaces and grain. Toggle the theme to compare.
        </p>
      </section>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {swatches.map(([label, cls]) => (
          <div key={label} className="glass rounded-lg p-3">
            <div className={`${cls} h-16 rounded-md border border-border`} />
            <p className="mt-2 font-mono text-xs text-fg-muted">{label}</p>
          </div>
        ))}
      </section>

      <section className="glass rounded-lg p-6 shadow-glow">
        <h2 className="font-display text-h3">Glass card</h2>
        <p className="mt-2 text-fg-muted">
          Body text in the text font, <span className="font-mono text-accent">mono accent</span> in
          the code font.
        </p>
        <a href="#" className="mt-4 inline-block text-accent underline underline-offset-4">
          Focus me with Tab to check the focus ring
        </a>
      </section>
    </main>
  );
}
