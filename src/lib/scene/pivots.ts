/**
 * Purpose: measure where each scene stage is "reached" in scroll pixels, from the real section positions. Because it
 * reads the DOM, the scene stays aligned when copy, fonts or the layout change. Client only.
 * Stage order (matches STAGES in timeline.ts): 0 hero, 1 about, 2 skills, 3 showcase start, 4 showcase end,
 * 5 recede, 6 pre-contact, 7 contact (bottom of the page).
 * Used by: components/scene/scene.tsx.
 */
export function computePivots(): number[] | null {
  const about = document.getElementById("about");
  const skills = document.getElementById("skills");
  const showcase = document.getElementById("showcase");
  const contact = document.getElementById("contact");
  if (!about || !skills || !showcase || !contact) return null;

  const vh = window.innerHeight;
  const sy = window.scrollY;
  const top = (el: HTMLElement) => el.getBoundingClientRect().top + sy;
  const mid = (el: HTMLElement) => top(el) + el.offsetHeight / 2 - vh / 2;
  const maxScroll = Math.max(0, document.documentElement.scrollHeight - vh);

  const p = [
    0,
    mid(about),
    mid(skills),
    top(showcase),
    top(showcase) + showcase.offsetHeight - vh,
    0,
    0,
    0,
  ];
  p[5] = (p[4] ?? 0) + vh * 0.7;
  const wantedPre = top(contact) - vh * 0.9;
  p[6] = Math.min(
    Math.max(wantedPre, (p[5] ?? 0) + 1),
    Math.max((p[5] ?? 0) + 1, maxScroll - vh * 0.5),
  );
  p[7] = Math.max(maxScroll, (p[6] ?? 0) + 1);

  // strictly increasing
  for (let i = 1; i < p.length; i++) p[i] = Math.max(p[i] ?? 0, (p[i - 1] ?? 0) + 1);
  return p;
}
