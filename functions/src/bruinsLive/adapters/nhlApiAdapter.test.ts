import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import type {
  NhlLandingResponse,
  NhlScheduleResponse,
} from '../providers/SportsDataProvider'
import { selectRelevantGame, toGameState } from './nhlApiAdapter'

const fixturesRoot = resolve(process.cwd(), 'src', 'bruinsLive', 'fixtures')

const loadFixture = <T>(filename: string): T =>
  JSON.parse(readFileSync(resolve(fixturesRoot, filename), 'utf-8')) as T

describe('nhlApiAdapter', () => {
  it('selects the game matching today dateKey', () => {
    const schedule = loadFixture<NhlScheduleResponse>('nhl-schedule.json')
    const game = selectRelevantGame(
      schedule,
      '2026-02-08',
      new Date('2026-02-08T02:00:00Z'),
    )

    expect(game?.id).toBe(2026020801)
  })

  it('maps scheduled games without scores or clock', () => {
    const schedule = loadFixture<NhlScheduleResponse>('nhl-schedule.json')
    const game = schedule.games?.[0]

    if (!game) {
      throw new Error('Missing schedule game fixture.')
    }

    const state = toGameState(game, null, '2026-02-08T01:00:00Z')

    expect(state.status).toBe('scheduled')
    expect(state.opponentName).toBe('Rangers')
    expect(state.isHome).toBe(true)
    expect(state.scoreHome).toBeNull()
    expect(state.scoreAway).toBeNull()
    expect(state.period).toBeNull()
    expect(state.clock).toBeNull()
  })

  it('maps live games with scores, period, and clock', () => {
    const schedule = loadFixture<NhlScheduleResponse>('nhl-schedule.json')
    const landing = loadFixture<NhlLandingResponse>('nhl-live.json')
    const game = schedule.games?.[0]

    if (!game) {
      throw new Error('Missing schedule game fixture.')
    }

    const liveGame = { ...game, gameState: 'LIVE' }
    const state = toGameState(liveGame, landing, '2026-02-08T01:00:00Z')

    expect(state.status).toBe('live')
    expect(state.scoreHome).toBe(2)
    expect(state.scoreAway).toBe(1)
    expect(state.period).toBe(2)
    expect(state.clock).toBe('05:43')
  })

  it('maps final games with scores and no clock', () => {
    const schedule = loadFixture<NhlScheduleResponse>('nhl-schedule.json')
    const landing = loadFixture<NhlLandingResponse>('nhl-final.json')
    const game = schedule.games?.[0]

    if (!game) {
      throw new Error('Missing schedule game fixture.')
    }

    const finalGame = { ...game, gameState: 'FINAL' }
    const state = toGameState(finalGame, landing, '2026-02-08T03:00:00Z')

    expect(state.status).toBe('final')
    expect(state.scoreHome).toBe(3)
    expect(state.scoreAway).toBe(2)
    expect(state.period).toBe(3)
    expect(state.clock).toBeNull()
  })
})
