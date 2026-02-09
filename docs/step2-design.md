# Step 2 Design: Shared Contracts

## Problem statement
Create a single source of truth for the "game state" and "today state" payloads
shared across backend, admin UI, and iOS so all systems agree on field names,
required/optional values, and nullability.

## Requirements
- Add `contracts/game-state.json` and `contracts/today-state.json`.
- Document required vs optional fields and allowed values.
- Validate fixtures against contracts in `functions` tests.
- Reject invalid contract shapes in tests.

## Approach
1. Define JSON Schema files for game and today states under `contracts/`.
2. Add fixture JSON files under `functions/src/bruinsLive/fixtures/`.
3. Use Ajv in Vitest to validate fixtures and a few invalid examples.

## Non-goals
- Generate types or SDKs (can be added later).
- Integrate contracts into runtime code yet.
