/**
 * Purpose: filesystem-based file lookup, used ONLY by tests (and tooling). The site itself uses the build-time manifest
 * in lib/media.ts. Keeping fs out of the runtime module also avoids bundler warnings about tracing the whole project.
 */
import fs from "node:fs";
import path from "node:path";

export function findFile(
  dir: string,
  publicBase: string,
  name: string,
  extensions: readonly string[],
): string | undefined {
  for (const ext of extensions) {
    if (fs.existsSync(path.join(dir, `${name}.${ext}`))) return `${publicBase}/${name}.${ext}`;
  }
  return undefined;
}
