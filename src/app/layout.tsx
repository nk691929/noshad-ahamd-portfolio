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
import "@/styles/mobile.css";

export const metadata: Metadata = siteMetadata();
export const viewport = siteViewport;

/**
 * Decides, before first paint, which experience this device gets and sets <html data-scene="...">:
 *   "on"   desktop-class (wide screen, mouse, 4+ cores, WebGL): the full WebGL 3D scene.
 *   "lite" phones and tablets, or when WebGL / memory is limited: NO WebGL and NO three.js download; the page uses a
 *          CSS laptop in the showcase and lighter effects. (Mobile Safari kills tabs that use too much GPU memory.)
 *   unset  reduced motion or data saver: the plain static design.
 * If the 3D scene later fails the attribute is set to "lite".
 */
const SCENE_GATE = `(function(){try{var d=document.documentElement;var m=function(q){return window.matchMedia(q).matches};if(m("(prefers-reduced-motion: reduce)"))return;var c=navigator.connection;if(c&&c.saveData)return;var desktop=m("(min-width: 1024px)")&&m("(hover: hover) and (pointer: fine)");var cores=navigator.hardwareConcurrency;var mem=navigator.deviceMemory;var strong=desktop&&(typeof cores!=="number"||cores>=4)&&(typeof mem!=="number"||mem>=4);var gl=false;if(strong){var cv=document.createElement("canvas");var g=cv.getContext("webgl2")||cv.getContext("webgl");gl=!!g;if(g){var x=g.getExtension("WEBGL_lose_context");if(x)x.loseContext();}}d.setAttribute("data-scene",strong&&gl?"on":"lite");}catch(e){}})();`;

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
