import { computeEffectiveChannel } from '../computeEffectiveChannel.js'
import { getTodayKey } from '../getTodayKey.js'
import {
  getNhlSeasonId,
  selectRelevantGame,
  toGameState,
} from '../adapters/nhlApiAdapter.js'
import type { SportsDataProvider } from '../providers/SportsDataProvider.js'
import type { GameState, GameStatus, TodayState } from '../types.js'
import type { BruinsLiveStore } from './firestoreClient.js'

export type PollTodayGameResult = {
  dateKey: string
  gameId: string | null
  status: GameStatus | null
  hasGameChange: boolean
  hasTodayChange: boolean
}

type PollTodayGameDeps = {
  provider: SportsDataProvider
  store: BruinsLiveStore
  now?: Date
}

const isSameToday = (left: TodayState | null, right: TodayState): boolean => {
  if (!left) {
    return false
  }

  return (
    left.dateKey === right.dateKey &&
    left.gameId === right.gameId &&
    left.effectiveChannel === right.effectiveChannel &&
    left.channelOverride === right.channelOverride &&
    left.channelOverrideNote === right.channelOverrideNote
  )
}

const isSameGameState = (left: GameState | null, right: GameState): boolean => {
  if (!left) {
    return false
  }

  return (
    left.gameId === right.gameId &&
    left.startTime === right.startTime &&
    left.status === right.status &&
    left.opponentName === right.opponentName &&
    left.isHome === right.isHome &&
    left.scoreHome === right.scoreHome &&
    left.scoreAway === right.scoreAway &&
    left.period === right.period &&
    left.clock === right.clock
  )
}

export const pollTodayGame = async ({
  provider,
  store,
  now = new Date(),
}: PollTodayGameDeps): Promise<PollTodayGameResult> => {
  const config = await store.getConfig()
  const dateKey = getTodayKey(config.timezone, now)
  const existingToday = await store.getToday(dateKey)
  const channelOverride = existingToday?.channelOverride ?? null
  const channelOverrideNote = existingToday?.channelOverrideNote ?? null
  const effectiveChannel = computeEffectiveChannel(
    config.defaultChannel,
    channelOverride,
  )
  const seasonId = getNhlSeasonId(now)
  const schedule = await provider.getSchedule(seasonId)
  const selectedGame = selectRelevantGame(schedule, dateKey, now)
  const updatedAt = now.toISOString()

  if (!selectedGame) {
    const todayState: TodayState = {
      dateKey,
      gameId: null,
      effectiveChannel,
      channelOverride,
      channelOverrideNote,
      updatedAt,
    }
    const hasTodayChange = !isSameToday(existingToday, todayState)

    if (hasTodayChange) {
      await store.setToday(todayState)
    }

    return {
      dateKey,
      gameId: null,
      status: null,
      hasGameChange: false,
      hasTodayChange,
    }
  }

  const gameId = selectedGame.id ? String(selectedGame.id) : null

  if (!gameId) {
    throw new Error('Schedule game is missing an id.')
  }

  const existingGame = await store.getGame(gameId)
  const landing = await provider.getGameLanding(gameId)
  const gameState = toGameState(selectedGame, landing, updatedAt)
  const hasGameChange = !isSameGameState(existingGame, gameState)

  if (hasGameChange) {
    await store.setGame(gameState)
  }

  const todayState: TodayState = {
    dateKey,
    gameId: gameState.gameId,
    effectiveChannel,
    channelOverride,
    channelOverrideNote,
    updatedAt,
  }
  const hasTodayChange = !isSameToday(existingToday, todayState)

  if (hasTodayChange) {
    await store.setToday(todayState)
  }

  return {
    dateKey,
    gameId: gameState.gameId,
    status: gameState.status,
    hasGameChange,
    hasTodayChange,
  }
}
