# Doc 2: V1 Steps

## Bruins Live Lock Screen — V1 Implementation Steps

### V1 Definition of Done
- Admin can set today’s SiriusXM channel override
- Backend dynamically determines today/next Bruins game
- Firestore reflects accurate game + channel state
- iOS Live Activity displays status + channel
- Push updates occur on status or channel changes
- Most development happens off-Mac
- Every step includes passing unit tests
- **All TODO checklists are fully checked**

---

## Repo layout
```
contracts/
docs/
admin-web/
functions/
ios/
```

---

## Step 0 — Repo + tooling bootstrap (off-Mac)

**Outcome**
- Monorepo exists with web + backend test infrastructure in place

**To do**
- [x] Create a folder structure, creating directories that do not exist and a general .gitignore for all the probable files
- [x] Initialize `admin-web` with Vite + React + TypeScript (use the Context7 MCP tool to use the latest versions of any libraries)
- [x] Configure Vitest + Testing Library
- [x] Add in prettier, eslint, and a tsc command to make sure there are no type errors
- [x] Wire that all up to the commit command using husky
- [x] Add at least one trivial component + test
- [x] Initialize `functions` TypeScript project
- [x] Configure Vitest for functions
- [x] Add at least one trivial pure function + test

**Tests**
- [x] `admin-web` tests pass via Vitest
- [x] `functions` tests pass via Vitest

**Acceptance**
- [x] `pnpm -C admin-web test` passes
- [x] `pnpm -C functions test` passes
- [x] All items checked off the list of TODOs

**Prompt**
> Use `docs/architecture.md` and `docs/v1-steps.md`. Implement Step 0 scaffolding. Use Vite + React + TypeScript + Vitest for `admin-web`, and TypeScript + Vitest for `functions`. Ensure tests pass and include commands to run them.

---

## Step 1 — Firestore schema + additive rules (off-Mac)

**Outcome**
- Firestore has initial Bruins Live documents
- Firestore rules safely allow Bruins Live without impacting other apps

**To do**
- [x] Create Firebase project
- [x] Initialize Firestore
- [x] Create `/bruinsLive/app/config/public`
- [x] Create `/bruinsLive/app/today/{dateKey}`
- [x] Add Firestore rules:
  - [x] Rules are **additive**
  - [x] Rules are scoped to `/bruinsLive/app/**`
  - [x] Existing apps remain unaffected

**Tests (functions / Vitest)**
- [x] Unit test `getTodayKey(timezone)`
- [x] Unit test `computeEffectiveChannel(default, override)`

**Acceptance**
- [x] Firestore rules deployed
- [x] No existing rules removed or modified
- [x] All Vitest tests pass
- [x] All items checked off the list of TODOs

**Prompt**
> Use `docs/architecture.md`. Implement Firestore helpers for dateKey and effectiveChannel in `functions`, with Vitest tests. Draft additive Firestore rules scoped only to `/bruinsLive/app/**`.

---

## Step 2 — Shared contracts (off-Mac)

**Outcome**
- A single source of truth exists for “today state” and “game state”

**To do**
- [x] Create `contracts/game-state.json`
- [x] Create `contracts/today-state.json`
- [x] Document required and optional fields
- [x] Ensure contracts match Firestore schema

**Tests (functions / Vitest)**
- [x] Validate fixture data against contracts
- [x] Reject invalid contract shapes

**Acceptance**
- [x] Contracts committed
- [x] Backend code depends on contracts
- [x] All tests pass
- [x] All items checked off the list of TODOs

**Prompt**
> Use `docs/architecture.md`. Define shared JSON contracts for game state and today state. Add validation tests in `functions` using fixture data.

---

## Step 3 — Admin UI: channel override (off-Mac)

**Outcome**
- Admin can view and override today’s SiriusXM channel

**To do**
- [x] Create admin UI using React + Vite
- [x] Display default channel from `/bruinsLive/app/config/public`
- [x] Display effective channel from `/bruinsLive/app/today/{dateKey}`
- [x] Allow setting `channelOverride` and note
- [x] Allow clearing override
- [x] Wrap Firebase access behind `dataClient`

**Tests (Vitest + Testing Library)**
- [x] Render default + effective channel
- [x] Save override calls correct client method
- [x] Clear override resets state
- [x] Firebase client mocked (no real calls)

**Acceptance**
- [x] Admin UI tests pass
- [x] Admin UI deploys to Firebase Hosting
- [x] Override updates Firestore correctly
- [x] All items checked off the list of TODOs

**Prompt**
> Use `docs/architecture.md`. Build the admin UI for viewing and setting `/bruinsLive/app/today/{dateKey}.channelOverride`. Use React + Vite + Vitest. Mock Firebase via a dataClient abstraction.

---

## Step 4 — Poller + game state (off-Mac)

**Outcome**
- Scheduled backend function maintains accurate game state

**To do**
- [x] Implement `SportsDataProvider` interface
- [x] Implement `NhlApiProvider` (Cloud Functions only)
- [x] Parse gameId, startTime, status, opponent, home/away
- [x] Compute Eastern `dateKey`
- [x] Write `/bruinsLive/app/games/{gameId}`
- [x] Write `/bruinsLive/app/today/{dateKey}`
- [x] Compute `effectiveChannel = override ?? default ("91")`
- [x] Detect meaningful diffs for push triggers

**Tests (functions / Vitest)**
- [x] Adapter parsing tests (scheduled/live/final)
- [x] Poller logic tests with fixtures only
- [x] No network calls in tests

**Acceptance**
- [ ] Poller deployed
- [ ] Firestore updates correctly from real NHL data
- [x] All tests pass
- [x] All items checked off the list of TODOs

---

## Step 5 — iOS app shell + Live Activity UI (Mac required)

**Outcome**
- Native SwiftUI app displays current Bruins status

**To do**
- [ ] Create SwiftUI app shell
- [ ] Read Firestore `/bruinsLive/app/today/{dateKey}`
- [ ] Resolve linked game doc
- [ ] Implement Live Activity UI
- [ ] Start/Stop Live Activity controls

**Tests (XCTest)**
- [ ] Status text formatting
- [ ] Channel line formatting

**Acceptance**
- [ ] App runs in simulator/device
- [ ] Live Activity visible on Lock Screen
- [ ] XCTest tests pass
- [ ] All items checked off the list of TODOs

---

## Step 6 — Live Activity token registration (Mac required)

**Outcome**
- Backend can target devices for push updates

**To do**
- [ ] Generate and persist `deviceId`
- [ ] Capture Live Activity push token
- [ ] POST token to backend
- [ ] Store token in `/bruinsLive/app/devices/{deviceId}`

**Tests**
- [ ] Request builder unit test (XCTest or functions Vitest)

**Acceptance**
- [ ] Device document appears in Firestore
- [ ] Token stored correctly
- [ ] All items checked off the list of TODOs

---

## Step 7 — Push updates (Mac + backend)

**Outcome**
- Lock Screen updates automatically when data changes

**To do**
- [ ] Implement ActivityKit push sender
- [ ] Authenticate via APNs
- [ ] Trigger push on:
  - [ ] channel override change
  - [ ] game status change
- [ ] Handle partial failures gracefully

**Tests (functions / Vitest)**
- [ ] Payload construction
- [ ] Device selection logic
- [ ] Error handling paths

**Acceptance**
- [ ] Channel override updates Lock Screen within seconds
- [ ] Status transitions update Lock Screen
- [ ] All tests pass
- [ ] All items checked off the list of TODOs

---

## Step 8 — Hardening (still V1)

**Outcome**
- System is safe, observable, and resilient

**To do**
- [ ] Add push kill switch in `/bruinsLive/app/config/public`
- [ ] Rate-limit admin writes
- [ ] Gracefully handle missing game data
- [ ] Add structured logging in functions

**Acceptance**
- [ ] No regressions
- [ ] Monitoring data visible
- [ ] All items checked off the list of TODOs

---

## Canonical doc-aware prompt

> I’m implementing Bruins Live V1.  
> Use `docs/architecture.md` and `docs/v1-steps.md` as the source of truth.  
> All Firebase data must be namespaced under `/bruinsLive/app/**`.
> Firestore rules changes must be additive and must not break other apps.  
> Prefer backend/web-first work; keep iOS native and minimal.  
> Use straight React + Vite + Vitest for web and backend.  
> Each step must include fully working unit tests.  
> **All TODO items must be checked off before a step is considered complete.**  
> Provide exact file changes and commands to run tests.
