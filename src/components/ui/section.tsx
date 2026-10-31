/**
 * Purpose: shared section wrapper with landmark label, spacing and heading block.
 * Inputs: id (anchor + nav target), eyebrow, title, optional intro. Used by: every section except the hero.
 */
type Props = {
  id: string;
  eyebrow: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
};

export function Section({ id, eyebrow, title, intro, children }: Props) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24 py-20 md:py-28">
      <div className="mx-auto w-full max-w-6xl px-6">
        <header className="mb-12 max-w-2xl">
          <p className="font-mono text-sm uppercase tracking-widest text-accent">{eyebrow}</p>
          <h2 id={`${id}-title`} className="mt-3 font-display text-h2">
            {title}
          </h2>
          {intro ? <p className="mt-4 text-lg text-fg-muted">{intro}</p> : null}
        </header>
        {children}
      </div>
    </section>
  );
}
