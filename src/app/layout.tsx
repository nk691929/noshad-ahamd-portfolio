/**
 * Purpose: root layout. Applies fonts, theme provider, grain overlay, skip link and base metadata.
 * Full SEO metadata arrives in step 7. Used by: every route.
 */
import type { Metadata } from "next";
import { fontDisplay, fontMono, fontText } from "@/lib/fonts";
import { MotionRoot } from "@/components/motion/motion-root";
import { ThemeProvider } from "@/components/theme-provider";
import "@/styles/globals.css";
import "@/styles/sections.css";

export const metadata: Metadata = {
  title: "Noshad Ahmad | Flutter Developer",
  description: "Portfolio of Noshad Ahmad, Flutter developer and AI-enabled web builder.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fontDisplay.variable} ${fontText.variable} ${fontMono.variable}`}
    >
      <body className="grain">
        <a
          href="#main"
          className="sr-only z-[200] rounded-full bg-fg px-4 py-2 text-bg focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <noscript>
          <style>{"[data-reveal]{opacity:1!important;transform:none!important}"}</style>
        </noscript>
        <ThemeProvider>{children}</ThemeProvider>
        <MotionRoot />
      </body>
    </html>
  );
}
