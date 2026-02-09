import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import type {
  NhlLandingResponse,
  NhlScheduleResponse,
  SportsDataProvider,
} from '../providers/SportsDataProvider'
import type { GameState, PublicConfig, TodayState } from '../types'
import type { BruinsLiveStore } from './firestoreClient'
import { pollTodayGame } from './pollTodayGame'

const fixturesRoot = resolve(process.cwd(), 'src', 'bruinsLive', 'fixtures')

const loadFixture = <T>(filename: string): T =>
  JSON.parse(readFileSync(resolve(fixturesRoot, filename), 'utf-8')) as T

const buildStore = (config: PublicConfig, today?: TodayState | null) => {
  const todayByDate = new Map<string, TodayState>()
  const gameById = new Map<string, GameState>()

  if (today) {
    todayByDate.set(today.dateKey, today)
  }

  const store: BruinsLiveStore = {
    async getConfig() {
      return config
    },
    async getToday(dateKey) {
      return todayByDate.get(dateKey) ?? null
    },
    async getGame(gameId) {
      return gameById.get(gameId) ?? null
    },
    async setToday(state) {
      todayByDate.set(state.dateKey, state)
    },
    async setGame(state) {
      gameById.set(state.gameId, state)
    },
  }

  return { store, todayByDate, gameById }
}

const buildProvider = (
  schedule: NhlScheduleResponse,
  landing: NhlLandingResponse | null,
): SportsDataProvider => ({
  async getSchedule(seasonId: string) {
    void seasonId
    return schedule
  },
  async getGameLanding(gameId: string) {
    void gameId
    if (!landing) {
      throw new Error('Landing fixture missing.')
    }
    return landing
  },
})

describe('pollTodayGame', () => {
  it('writes today and game state with override channel', async () => {
    const schedule = loadFixture<NhlScheduleResponse>('nhl-schedule.json')
    const landing = loadFixture<NhlLandingResponse>('nhl-live.json')
    const existingToday: TodayState = {
      dateKey: '2026-02-08',
      gameId: null,
      effectiveChannel: '91',
      channelOverride: '99',
      channelOverrideNote: 'Test override',
      updatedAt: '2026-02-08T00:00:00Z',
    }
    const { store, todayByDate, gameById } = buildStore(
      { defaultChannel: '91', timezone: 'America/New_York' },
      existingToday,
    )
    const provider = buildProvider(schedule, landing)
    const now = new Date('2026-02-08T15:00:00Z')

    const result = await pollTodayGame({ provider, store, now })

    const today = todayByDate.get('2026-02-08')
    const game = gameById.get('2026020801')

    expect(result.gameId).toBe('2026020801')
    expect(result.status).toBe('live')
    expect(today?.effectiveChannel).toBe('99')
    expect(today?.channelOverrideNote).toBe('Test override')
    expect(game?.opponentName).toBe('Rangers')
    expect(game?.startTime).toBe('2026-02-08T00:30:00Z')
    expect(game?.status).toBe('live')
  })

  it('writes today state with null game when none found', async () => {
    const emptySchedule: NhlScheduleResponse = { games: [] }
    const landing = loadFixture<NhlLandingResponse>('nhl-live.json')
    const provider = buildProvider(emptySchedule, landing)
    const { store, todayByDate } = buildStore({
      defaultChannel: '91',
      timezone: 'America/New_York',
    })

    const result = await pollTodayGame({
      provider,
      store,
      now: new Date('2026-02-08T15:00:00Z'),
    })

    const today = todayByDate.get('2026-02-08')

    expect(result.gameId).toBeNull()
    expect(result.status).toBeNull()
    expect(today?.gameId).toBeNull()
    expect(today?.effectiveChannel).toBe('91')
  })
})
