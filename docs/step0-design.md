# Step 0 Design: Repo + Tooling Bootstrap

## Problem statement
Bootstrap the Bruins Live monorepo so that web and backend packages are ready
for test-first development. The goal is to establish React + Vite + TypeScript
with Vitest + Testing Library for `admin-web`, and TypeScript + Vitest for
`functions`, including basic linting/formatting, type checking, and commit-time
verification. No Firebase integration is included in Step 0.

## Requirements
- Vite + React + TypeScript + Vitest + Testing Library for `admin-web`.
- TypeScript + Vitest for `functions`.
- At least one passing unit test in each package.
- ESLint, Prettier, and `tsc` typecheck commands wired to pre-commit.
- Provide exact commands to run tests.
- Keep Firebase out (scaffolding only).

## Approach
1. Create the repo structure: `admin-web/`, `functions/`, `contracts/`, `ios/`,
   plus a root `.gitignore`.
2. Scaffold `admin-web` using the official Vite React + TS template, then add
   Vitest + Testing Library setup, a minimal component, and a test.
3. Initialize `functions` as a minimal TypeScript project with Vitest, a pure
   function, and a test.
4. Add ESLint + Prettier configs, `typecheck` scripts, and Husky pre-commit
   hook that runs lint, typecheck, and tests in both packages.

## Non-goals
- Firebase setup, emulators, or deployment.
- Any iOS code or Live Activity implementation.
