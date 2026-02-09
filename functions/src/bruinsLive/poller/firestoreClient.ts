import type { Firestore } from 'firebase-admin/firestore'
import type { GameState, PublicConfig, TodayState } from '../types.js'

export type BruinsLiveStore = {
  getConfig: () => Promise<PublicConfig>
  getToday: (dateKey: string) => Promise<TodayState | null>
  getGame: (gameId: string) => Promise<GameState | null>
  setToday: (state: TodayState) => Promise<void>
  setGame: (state: GameState) => Promise<void>
}

const configDocPath = 'bruinsLive/app/config/public'
const todayDocPath = (dateKey: string) => `bruinsLive/app/today/${dateKey}`
const gameDocPath = (gameId: string) => `bruinsLive/app/games/${gameId}`

const assertString = (value: unknown, label: string): string => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Expected ${label} to be a non-empty string.`)
  }

  return value
}

export const createFirestoreStore = (db: Firestore): BruinsLiveStore => ({
  async getConfig() {
    const snapshot = await db.doc(configDocPath).get()
    const data = snapshot.data()

    if (!data) {
      throw new Error(
        'Missing Bruins Live config at /bruinsLive/app/config/public.',
      )
    }

    return {
      defaultChannel: assertString(data.defaultChannel, 'defaultChannel'),
      timezone: assertString(data.timezone ?? 'America/New_York', 'timezone'),
    }
  },

  async getToday(dateKey) {
    const snapshot = await db.doc(todayDocPath(dateKey)).get()
    return (snapshot.exists ? (snapshot.data() as TodayState) : null) ?? null
  },

  async getGame(gameId) {
    const snapshot = await db.doc(gameDocPath(gameId)).get()
    return (snapshot.exists ? (snapshot.data() as GameState) : null) ?? null
  },

  async setToday(state) {
    await db.doc(todayDocPath(state.dateKey)).set(state)
  },

  async setGame(state) {
    await db.doc(gameDocPath(state.gameId)).set(state)
  },
})
