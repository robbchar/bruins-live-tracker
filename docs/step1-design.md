# Step 1 Design: Firestore Schema + Helpers

## Problem statement
Establish the initial Bruins Live Firestore schema and rules, and add tested
backend helpers for computing the Eastern `dateKey` and the effective SiriusXM
channel. This prepares the backend for later polling and admin overrides while
keeping Firebase integration minimal.

## Requirements
- Draft additive Firestore rules scoped only to `/bruinsLive/**`.
- Define the initial Firestore documents for `/bruinsLive/config/public` and
  `/bruinsLive/today/{dateKey}` in a clear, reproducible way.
- Implement and test `getTodayKey(timezone)` and
  `computeEffectiveChannel(default, override)` in `functions`.

## Approach
1. Add a root `firestore.rules` file with an additive rules section for
   `/bruinsLive/**` that can be safely merged into a shared Firebase project.
2. Capture initial Firestore document shapes as JSON seed files to make the
   expected fields explicit and ready for future seeding.
3. Implement `getTodayKey` using `Intl.DateTimeFormat` with timezone support
   and allow an injectable `Date` for deterministic tests.
4. Implement `computeEffectiveChannel` as a small pure function that prefers
   a trimmed override when present; otherwise returns the default.
5. Add Vitest unit tests for both helpers with fixed dates and inputs.

## Non-goals
- Firebase project creation or deployment.
- Live Firestore writes (handled in later steps).
