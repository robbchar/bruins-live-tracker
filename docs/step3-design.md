# Step 3 Design: Admin UI Channel Override

## Problem statement
Provide a simple admin UI that reads today's Bruins Live state and lets an
admin set or clear the SiriusXM channel override for the current day.

## Requirements
- Display default channel from `/bruinsLive/app/config/public`.
- Display effective channel from `/bruinsLive/app/today/{dateKey}`.
- Allow setting `channelOverride` and an optional note.
- Allow clearing the override.
- Wrap Firebase access behind a `dataClient` abstraction.
- Tests cover UI rendering and override flows.

## Approach
1. Add `dataClient` module with typed methods for fetching config and today
   state, plus setting and clearing overrides.
2. Build a minimal form in `App` that loads data and calls the client methods.
3. Write RTL tests with a mocked `dataClient` to verify:
   - Default + effective channels render
   - Save calls set override with the expected payload
   - Clear calls clear override and resets inputs

## Non-goals
- Real Firebase integration (added in later steps).
- Authentication or access control.
