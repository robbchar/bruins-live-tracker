# Doc 1: Architecture

## Bruins Live Lock Screen — Architecture (Live Activity + Firebase)

### Goals
- Show **“Bruins game live / not live”** and **SiriusXM channel** on iPhone Lock Screen via **Live Activity**.
- Support **manual override** of the SiriusXM channel via a simple admin UI.
- Keep the system reliable without requiring the iPhone app to poll constantly.
- Maximize development that can happen **off-Mac**, reserving macOS/Xcode for true Apple-only steps.

### Non-goals (V1)
- Full play-by-play, penalties, shot charts, etc.
- Auto-discovery of SiriusXM channel from SiriusXM.
- Multi-team support (can come later).

---

## High-level system diagram

**iOS App (SwiftUI + ActivityKit)**
- Starts a Live Activity (“Tracking Bruins”)
- Registers its Live Activity push token with backend
- Displays: opponent, status (LIVE/Scheduled/Final), channel number

**Firebase**
- Firestore: source of truth for “today’s game” and “channel”
- Cloud Functions:
  - Scheduled poller to update game status
  - Push updater to update Live Activity on devices
- Firebase Hosting: Admin UI (React + Vite)
- Optional: Firebase Auth for admin access

**External sports data**
- One NHL schedule/game-status provider
- V1 only needs: `gameId`, `startTime`, `status`, `opponent`, `home/away`, optional `score`

---

## Firebase data namespacing (critical)

This Firebase project hosts multiple apps.  
**All Bruins Live data MUST be namespaced under a single root.**

### Namespace
**Root prefix:** `/bruinsLive/**`

All collections and documents for this app live under that prefix.

Examples:
- `/bruinsLive/config/public`
- `/bruinsLive/games/{gameId}`
- `/bruinsLive/today/{dateKey}`
- `/bruinsLive/devices/{deviceId}`

This ensures:
- no collisions with other apps
- simpler, safer Firestore rules
- easier long-term maintenance

---

## Firestore rules change policy (critical)

Because other applications share this Firebase project:

- **All Firestore rules changes MUST be additive updates**
- Existing rules for other apps must remain untouched
- Do **not** replace or simplify global rules
- Only add `match` blocks under `/bruinsLive/**`

### Operational rule
Bruins Live rules must live in a clearly commented section so future edits cannot accidentally break other apps.

---

## Data model (Firestore)

All paths below are relative to `/bruinsLive`.

### `config/public`
Public configuration.
- `teamId`: `"bruins"`
- `defaultChannel`: `"91"`
- `channelLabel`: `"SiriusXM"`
- `timezone`: `"America/New_York"`
- `updatedAt`: timestamp

### `games/{gameId}`
One doc per game.
- `gameId`: string
- `startTime`: timestamp
- `status`: `"scheduled" | "live" | "final"`
- `opponentName`: string
- `isHome`: boolean
- `scoreHome`: number | null
- `scoreAway`: number | null
- `period`: number | null
- `clock`: string | null
- `sourceUpdatedAt`: timestamp

### `today/{dateKey}`
Stable pointer for today’s relevant game.
- `dateKey`: `"YYYY-MM-DD"` (Eastern)
- `gameId`: string | null
- `effectiveChannel`: string
- `channelOverride`: string | null
- `channelOverrideNote`: string | null
- `updatedAt`: timestamp

### `devices/{deviceId}`
Live Activity registrations.
- `deviceId`: string
- `platform`: `"ios"`
- `teamId`: `"bruins"`
- `liveActivityPushToken`: string | null
- `createdAt`: timestamp
- `lastSeenAt`: timestamp
- `isActive`: boolean

---

## Backend-first, iOS-last workflow (intentional)

This project is designed so **most development happens off-Mac**.

### Can be developed on any machine
- Firebase Functions (TypeScript)
- Admin web app (React + Vite)
- Firestore schema + rules
- Sports data adapters
- All Vitest unit tests
- Shared data contracts

### Requires macOS + Xcode
- Compiling and running the iOS app
- iOS Simulator
- Live Activity UI
- Push entitlements and signing
- Publishing to TestFlight/App Store

macOS is used **only** for the Apple-specific integration layer.

---

## Shared contracts (important)

To keep iOS development minimal and predictable, the system uses a **shared contract layer**.

### `/contracts/` folder (repo root)
Defines the data shape used by:
- Cloud Functions
- Admin UI
- iOS app

Recommended contents:
- `today-state.json`
- `game-state.json`

These describe:
- `status`
- `opponentName`
- `startTime`
- `effectiveChannel`
- optional `score`

**Rules**
- Functions produce data matching the contract
- Admin UI and iOS consume the same shape
- iOS Swift structs mirror these contracts

This lets most logic be written, reviewed, and tested without Xcode.

---

## iOS app responsibilities (V1)

### App behavior
- Reads `/bruinsLive/today/{dateKey}` and related game doc
- Starts/stops Live Activity
- Registers Live Activity push token
- Displays status + channel

### Live Activity UI
- Title: “Bruins”
- Subtitle: “vs {Opponent}”
- Status: LIVE / Scheduled / Final
- Channel line: “SiriusXM {effectiveChannel}”

---

## Testing strategy

### Web (React + Vite)
- Vitest + Testing Library
- Firebase client wrapped behind `dataClient` for mocking

### Functions
- Vitest unit tests only
- No network calls in tests (fixtures only)

### iOS
- XCTest for domain/formatting logic
- UI verified in Simulator/device during Mac sessions

---

## Prompts you can reuse (architecture-aware)

**General implementation prompt**
> Use `docs/architecture.md` as the source of truth.  
> All Firebase data must be namespaced under `/bruinsLive/**`.  
> Firestore rules changes must be additive and must not break other apps.  
> Prefer backend/web-first implementations and keep iOS code minimal and native.  
> Include fully working unit tests (Vitest or XCTest as appropriate) and explain how to run them.

---

# Doc 2: V1 Steps

## Bruins Live Lock Screen — V1 Implementation Steps

### V1 Definition of Done
- Admin can set today’s channel override
- Backend writes today’s game state
- iOS Live Activity shows status + channel
- Push updates work
- Most logic authored off-Mac

---

## Repo layout
```
contracts/
docs/
admin-web/
functions/
ios/
```

## Data sources (explicit V1 decisions)

This section exists to prevent future ambiguity and accidental scope creep.

---

### Bruins game schedule & status

**Decision:**  
Bruins game data (upcoming games, start times, live/final status, opponent) **will NOT be hardcoded**.

**Rationale:**
- Games can be rescheduled, postponed, or moved
- Playoffs and preseason vary year to year
- Live status (“is it happening right now?”) cannot be safely inferred from static data
- The backend poller already exists, so this fits naturally

**Source (V1):**
- Use the NHL’s public JSON endpoints (commonly referenced as `api-web.nhle.com`)
- The poller determines:
  - today/next Bruins game
  - start time
  - status (`scheduled | live | final`)
  - opponent
- Results are written into:
  - `/bruinsLive/games/{gameId}`
  - `/bruinsLive/today/{dateKey}`

**Important constraint:**
- All NHL API calls are made **only from Cloud Functions**
- No direct NHL API calls from the iOS app or admin UI
- Unit tests must use fixture JSON (no live network calls)

This ensures correctness without requiring manual calendar maintenance.

---

### SiriusXM channel assignment

**Decision:**  
SiriusXM channel selection is **default + admin override**, not API-driven.

**Default behavior (V1):**
- `/bruinsLive/config/public.defaultChannel = "91"`
- `/bruinsLive/config/public.channelLabel = "SiriusXM"`

Channel **91** corresponds to *SiriusXM NHL Network Radio* and serves as the baseline.

**Override behavior:**
- Admin UI can set:
  - `/bruinsLive/today/{dateKey}.channelOverride`
- Backend computes:
  - `effectiveChannel = channelOverride ?? defaultChannel`
- Live Activity always displays `effectiveChannel`

**Rationale:**
- SiriusXM broadcast channel assignments are inconsistent and not reliably exposed via a stable public API
- A hardcoded default + override is:
  - simpler
  - more reliable
  - easier to correct quickly if needed

**Explicit non-goal (V1):**
- Automatically determining the correct SiriusXM play-by-play channel per game

This approach keeps the system operational even if SiriusXM details change unexpectedly.

---

### Summary (so we don’t forget)

- **Game data:** dynamic, API-driven, backend-only
- **Channel data:** static default (`91`) + manual admin override
- **Source of truth:** Firestore under `/bruinsLive/**`
- **No hardcoded schedules**
- **No SiriusXM channel API dependency**

These are intentional V1 tradeoffs.

