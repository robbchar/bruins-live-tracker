# Bruins Live

A small, focused system that shows **when a Boston Bruins game is live** and **which SiriusXM channel it’s on**, directly on the **iPhone Lock Screen** using **Live Activities**.

This project is intentionally designed to:
- be backend-driven and reliable
- minimize native iOS work
- allow most development to happen **off-Mac**
- use modern, test-first tooling
- stay simple and explicit

---

## What this does (V1)

- Displays a **Live Activity** on iOS showing:
  - opponent
  - game status (scheduled / live / final)
  - SiriusXM channel
- Uses a **default SiriusXM channel (91)** with a **manual admin override**
- Automatically updates when:
  - a game goes live or ends
  - the channel override changes
- Keeps all state in Firebase so the iOS app does not need to poll

---

## What this explicitly does *not* do (V1)

- No play-by-play or detailed stats
- No automatic SiriusXM channel discovery
- No multi-team support
- No hardcoded schedules

These are conscious scope decisions.

---

## Architecture overview

At a high level:

- **Firebase** is the source of truth
- **Cloud Functions** poll NHL game data and push Live Activity updates
- **React + Vite** admin UI manages channel overrides
- **iOS (SwiftUI + ActivityKit)** is a thin native shell

Most logic lives outside the iOS app.

Detailed architecture and rationale live in:
- `docs/architecture.md`
- `docs/v1-steps.md`

---

## Data sources

### Bruins game data
- Pulled dynamically from the NHL’s public JSON endpoints
- Fetched **only by Cloud Functions**
- Cached into Firestore
- Tested using fixture JSON (no live calls in tests)

### SiriusXM channel
- Default: **Channel 91 (NHL Network Radio)**
- Overridable per day via admin UI
- Displayed as `SiriusXM {effectiveChannel}`

---

## Firebase conventions (important)

This Firebase project hosts multiple apps.

### Namespacing
All data for this app lives under:

`/bruinsLive/**`


Examples:
- `/bruinsLive/config/public`
- `/bruinsLive/games/{gameId}`
- `/bruinsLive/today/{dateKey}`
- `/bruinsLive/devices/{deviceId}`

### Firestore rules
- All rules changes must be **additive**
- No existing rules for other apps may be broken
- Bruins Live rules are scoped only to `/bruinsLive/**`

---

## Repository structure

```
contracts/ # Shared JSON contracts (game state, today state)
docs/ # Architecture + step-by-step implementation plan
admin-web/ # React + Vite admin UI
functions/ # Firebase Cloud Functions (TypeScript)
ios/ # SwiftUI iOS app (Live Activity)
```

---

## Development philosophy

This project is built **backend-first** and **contract-driven**.

### Off-Mac development (primary)
You can fully develop and test:
- Cloud Functions
- Admin web UI
- Firestore schema and rules
- Sports data adapters
- Shared data contracts

All of this is:
- TypeScript
- Test-first
- Runnable via Vitest

### Mac-required development (limited)
You only need macOS + Xcode for:
- Compiling/running the iOS app
- Live Activity UI
- Push entitlements and signing
- Simulator / device testing
- TestFlight / App Store publishing

iOS is intentionally kept thin.

---

## Testing standards

This repo is test-first by design.

### Web + backend
- **Vitest** everywhere
- No live network calls in tests
- Firebase access wrapped so it can be mocked
- Each implementation step must include passing tests

### iOS
- **XCTest** for domain/formatting logic
- UI validated via Simulator/device

A step is not “done” unless:
- all tests pass
- all TODO checkboxes for that step are checked

---

## Using GPT-5.2-codex (Cursor)

The intended workflow is:
- Use **GPT-5.2-codex in Cursor** for implementation
- Use ChatGPT (this thread) for:
  - architecture clarification
  - design decisions
  - course correction
  - documentation updates

### Canonical implementation prompt

Use this when working inside Cursor:

> I’m implementing Bruins Live V1.  
> Use `docs/architecture.md` and `docs/v1-steps.md` as the source of truth.  
> All Firebase data must be namespaced under `/bruinsLive/**`.  
> Firestore rules changes must be additive and must not break other apps.  
> Prefer backend/web-first work; keep iOS native and minimal.  
> Use straight React + Vite + Vitest for web and backend.  
> Each step must include fully working unit tests.  
> All TODO items must be checked off before a step is considered complete.  
> Provide exact file changes and commands to run tests.

---

## Getting started

1. Read:
   - `docs/architecture.md`
   - `docs/v1-steps.md`
2. Start with **Step 0**
3. Work sequentially
4. Do not skip steps
5. Treat iOS work as an integration phase, not the core build

---

## Why this exists

This project exists to answer a very specific, very practical question:

> “Is there a Bruins game on right now, and what SiriusXM channel is it on?”

Everything else is in service of answering that question **clearly, reliably, and without friction**.

---

## Status

- Planning: ✅
- Architecture: ✅
- Implementation: ⏳ (Step 0 next)

# bruins-live-tracker
