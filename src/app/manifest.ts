/**
 * Purpose: web app manifest, so "Add to home screen" uses the portrait icon and the right name/colours.
 * Used by: Next.js (served at /manifest.webmanifest).
 */
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Noshad Ahmad | Flutter Developer",
    short_name: "Noshad Ahmad",
    description: "Portfolio of Noshad Ahmad, Flutter developer and AI-enabled web builder.",
    start_url: "/",
    display: "standalone",
    background_color: "#07080b",
    theme_color: "#07080b",
    icons: [
      { src: "/icon.png", sizes: "256x256", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
