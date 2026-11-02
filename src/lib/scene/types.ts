/**
 * Purpose: plain, serialisable data the server hands to the client-side 3D scene.
 */
export type Slide = { title: string; subtitle: string; cover?: string };
export type TechNode = { name: string; group: string };
export type SceneData = {
  /** slide 0 is the portfolio itself; slides 1..n are the showcase projects, in order */
  slides: Slide[];
  tech: TechNode[];
};
