/**
 * Purpose: self-hosted fonts via next/font (downloaded at build time, served from our origin).
 * Exposes CSS variables consumed by the Tailwind theme in globals.css.
 * Used by: src/app/layout.tsx.
 */
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";

export const fontDisplay = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display-var",
  display: "swap",
});

export const fontText = Inter({
  subsets: ["latin"],
  variable: "--font-text-var",
  display: "swap",
});

export const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-var",
  display: "swap",
});
