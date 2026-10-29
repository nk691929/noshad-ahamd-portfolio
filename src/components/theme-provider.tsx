"use client";

/**
 * Purpose: wraps next-themes. Dark by default, no OS auto-switch, persisted choice,
 * no flash on load (next-themes injects a blocking script that sets data-theme before paint).
 * Used by: src/app/layout.tsx.
 */
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
