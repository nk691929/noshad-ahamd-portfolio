/**
 * Purpose: colours used inside the WebGL scene. They mirror the CSS tokens (accent-1/2/3 in tokens.css) because
 * three.js cannot read CSS variables. Keep in sync when re-skinning.
 */
export const EMERALD = "#10c98f";
export const EMERALD_SOFT = "#5eead4";
export const BLUE = "#13b9fd";
export const DEEP_BLUE = "#02569b";
export const METAL = "#b9bec6";
export const INK = "#07080b";

/** Tint of a technology node by skill group. */
export const GROUP_TINT: Record<string, string> = {
  Mobile: BLUE,
  Backend: EMERALD,
  Web: "#e6edf5",
  Tools: "#9aa4b2",
};
