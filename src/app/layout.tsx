/**
 * Purpose: root layout. Applies fonts, theme provider, grain overlay, skip link and the site-wide SEO metadata
 * (lib/seo.ts). Used by: every route.
 */
import type { Metadata } from "next";
import { siteMetadata, viewport as siteViewport } from "@/lib/seo";
import { fontDisplay, fontMono, fontText } from "@/lib/fonts";
import { MotionRoot } from "@/components/motion/motion-root";
import { ThemeProvider } from "@/components/theme-provider";
import "@/styles/globals.css";
import "@/styles/sections.css";
import "@/styles/light.css";
import "@/styles/scene.css";
import "@/styles/ring.css";

export const metadata: Metadata = siteMetadata();
export const viewport = siteViewport;

/**
 * Decides, before first paint, whether the 3D scene may run: WebGL available, no reduced motion, no data saver, not a
 * very low-end device. Sets <html data-scene="on">; CSS then reserves room for the 3D laptop. If anything fails later
 * the attribute becomes "off" and the static design is used. (Creating and immediately losing a context is cheap.)
 */
const SCENE_GATE = `(function(){try{var d=document.documentElement;var rm=window.matchMedia("(prefers-reduced-motion: reduce)").matches;var c=navigator.connection;var sd=!!(c&&c.saveData);var lowMem=typeof navigator.deviceMemory==="number"&&navigator.deviceMemory<2;var lowCpu=typeof navigator.hardwareConcurrency==="number"&&navigator.hardwareConcurrency<=2;var cv=document.createElement("canvas");var gl=cv.getContext("webgl2")||cv.getContext("webgl");if(gl){var x=gl.getExtension("WEBGL_lose_context");if(x)x.loseContext();}if(gl&&!rm&&!sd&&!lowMem&&!lowCpu)d.setAttribute("data-scene","on");}catch(e){}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fontDisplay.variable} ${fontText.variable} ${fontMono.variable}`}
    >
      <body className="grain">
        <script dangerouslySetInnerHTML={{ __html: SCENE_GATE }} />
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
