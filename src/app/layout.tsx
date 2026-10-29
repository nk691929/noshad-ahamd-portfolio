/**
 * Purpose: root layout. Applies fonts, theme provider, grain overlay and base metadata.
 * Full SEO metadata arrives in step 7. Used by: every route.
 */
import type { Metadata } from "next";
import { fontDisplay, fontMono, fontText } from "@/lib/fonts";
import { ThemeProvider } from "@/components/theme-provider";
import "@/styles/globals.css";

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
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
