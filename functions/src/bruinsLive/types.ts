export type GameStatus = 'scheduled' | 'live' | 'final'

export type GameState = {
  gameId: string
  startTime: string
  status: GameStatus
  opponentName: string
  isHome: boolean
  scoreHome: number | null
  scoreAway: number | null
  period: number | null
  clock: string | null
  sourceUpdatedAt: string
}

export type TodayState = {
  dateKey: string
  gameId: string | null
  effectiveChannel: string
  channelOverride: string | null
  channelOverrideNote: string | null
  updatedAt: string
}

export type PublicConfig = {
  defaultChannel: string
  timezone: string
}
