import Ajv, { type AnySchema } from 'ajv'
import addFormats from 'ajv-formats'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { gameStateSchema, todayStateSchema } from './contracts.js'

const loadJson = (path: string) =>
  JSON.parse(readFileSync(path, 'utf-8')) as unknown

const fixturesRoot = resolve(process.cwd(), 'src', 'bruinsLive', 'fixtures')

const buildValidator = (schema: AnySchema) => {
  const ajv = new Ajv({ allErrors: true })
  addFormats(ajv)
  return ajv.compile(schema)
}

describe('contracts', () => {
  it('validates the game-state fixture', () => {
    const fixture = loadJson(resolve(fixturesRoot, 'game-state.json'))
    const validate = buildValidator(gameStateSchema as AnySchema)

    expect(validate(fixture)).toBe(true)
  })

  it('rejects invalid game-state data', () => {
    const validate = buildValidator(gameStateSchema as AnySchema)
    const invalid = {
      gameId: '2026020801',
      status: 'live',
      opponentName: 'Rangers',
      isHome: false,
    }

    expect(validate(invalid)).toBe(false)
  })

  it('validates the today-state fixture', () => {
    const fixture = loadJson(resolve(fixturesRoot, 'today-state.json'))
    const validate = buildValidator(todayStateSchema as AnySchema)

    expect(validate(fixture)).toBe(true)
  })

  it('rejects invalid today-state data', () => {
    const validate = buildValidator(todayStateSchema as AnySchema)
    const invalid = {
      dateKey: '2026-13-01',
      effectiveChannel: '91',
      gameId: null,
      channelOverride: null,
      channelOverrideNote: null,
      updatedAt: 'not-a-date',
    }

    expect(validate(invalid)).toBe(false)
  })
})
