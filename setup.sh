#!/usr/bin/env bash
# Purpose: one-time local bootstrap for step 1 (chore/scaffold).
# Installs latest stable deps, inits git, creates develop, commits, tags v0.1.0.
# Run from the project root: bash setup.sh
set -euo pipefail

pnpm add next react react-dom
pnpm add -D typescript @types/node @types/react @types/react-dom \
  tailwindcss @tailwindcss/postcss postcss \
  eslint eslint-config-next eslint-config-prettier prettier \
  husky lint-staged @commitlint/cli @commitlint/config-conventional \
  vitest

git init -b main
git config core.hooksPath .husky/_ 2>/dev/null || true
pnpm exec husky

git add -A
git commit -m "chore: scaffold project"
git tag v0.1.0
git branch develop
git switch develop

echo "Done. Now on 'develop'. Verify with: pnpm lint && pnpm typecheck && pnpm test && pnpm build"
