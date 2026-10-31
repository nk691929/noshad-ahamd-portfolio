// Purpose: list every unfilled TODO(owner) placeholder in /content so the owner knows what to supply.
// Run: pnpm todo. Inputs: files under content/. Output: file:line text on stdout.
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const root = path.resolve("content");
let count = 0;

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) walk(full);
    else if (/\.(ts|mdx)$/.test(name)) scan(full);
  }
}

function scan(file) {
  readFileSync(file, "utf8")
    .split(/\r?\n/)
    .forEach((line, i) => {
      if (line.includes("TODO(owner)") || /todo\(/.test(line)) {
        count++;
        console.log(`${path.relative(process.cwd(), file)}:${i + 1}  ${line.trim()}`);
      }
    });
}

walk(root);
console.log(`\n${count} placeholder line(s) to fill.`);
