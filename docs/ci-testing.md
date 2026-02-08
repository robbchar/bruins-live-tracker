# CI Testing Design

## Problem statement
Ensure pull requests run the full unit test suite in CI, while local pre-commit
hooks run only tests related to changed files to keep commits fast.

## Requirements
- PRs run all unit tests for `admin-web` and `functions`.
- Husky pre-commit runs relevant tests based on changed files.
- No new runtime dependencies in production builds.

## Approach
1. Add a GitHub Actions workflow triggered on `pull_request` to install
   dependencies and run both package test suites.
2. Update the Husky pre-commit hook to call `vitest` with `--changed` for both
   packages, while preserving lint, format, and typecheck steps.

## Non-goals
- Running tests on push to main (can be added later).
- Adding coverage reporting or artifact uploads.
