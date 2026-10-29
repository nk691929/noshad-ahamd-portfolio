/**
 * Purpose: Vitest config for utility and schema unit tests.
 * Used by: pnpm test.
 */
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@content": path.resolve(__dirname, "content"),
    },
  },
  test: { environment: "node", include: ["tests/**/*.test.ts"] },
});
