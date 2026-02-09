# Step 3 Design: Admin UI Channel Override

## Problem statement
Provide a simple admin UI that reads today's Bruins Live state and lets an
authenticated admin set or clear the SiriusXM channel override for the current
day.

## Requirements
- Display default channel from `/bruinsLive/app/config/public`.
- Display effective channel from `/bruinsLive/app/today/{dateKey}`.
- Allow setting `channelOverride` and an optional note.
- Allow clearing the override.
- Wrap Firebase access behind a `dataClient` abstraction.
- Gate the admin UI behind Firebase Auth (email/password + Google popup).
- Allowlist admin emails in Firestore rules.
- Tests cover UI rendering, auth gating, and override flows.

## Approach
1. Add `dataClient` module with typed methods for fetching config and today
   state, plus setting and clearing overrides.
2. Build a minimal form in `App` that loads data and calls the client methods.
3. Add Firebase Auth to the UI with a separate login screen.
4. Update Firestore rules to allow admin writes under `/bruinsLive/app/**`.
5. Write RTL tests with a mocked `dataClient` to verify:
   - Default + effective channels render
   - Save calls set override with the expected payload
   - Clear calls clear override and resets inputs
   - Sign-in form calls auth methods

## Non-goals
- Advanced role management beyond a simple allowlist.
