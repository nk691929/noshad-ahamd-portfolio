/**
 * Purpose: root layout (placeholder; fonts, theme provider and metadata arrive in later steps).
 * Used by: every route.
 */
import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Noshad Ahmad | Flutter Developer",
  description: "Portfolio of Noshad Ahmad, Flutter developer and AI-enabled web builder.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
