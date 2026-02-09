import type {
  NhlLandingResponse,
  NhlScheduleGame,
  NhlScheduleResponse,
  NhlScheduleTeam,
} from '../providers/SportsDataProvider'
import type { GameState, GameStatus } from '../types'

const bruinsAbbrev = 'BOS'

const normalizeState = (state?: string): string =>
  state?.trim().toUpperCase() ?? ''

const parseStartTime = (startTime?: string): number =>
  startTime ? Date.parse(startTime) : Number.NaN

const getTeamName = (team?: NhlScheduleTeam): string =>
  team?.commonName?.default ?? team?.placeName?.default ?? team?.abbrev ?? 'TBD'

const coerceNumber = (value: unknown): number | null =>
  typeof value === 'number' ? value : null

export const mapGameStatus = (state?: string): GameStatus => {
  const normalized = normalizeState(state)

  if (normalized === 'LIVE' || normalized === 'CRIT') {
    return 'live'
  }

  if (
    normalized === 'FINAL' ||
    normalized === 'OFFICIAL' ||
    normalized === 'OVER' ||
    normalized === 'FINALSO' ||
    normalized === 'FINALOT'
  ) {
    return 'final'
  }

  return 'scheduled'
}

export const getNhlSeasonId = (date: Date): string => {
  const year = date.getUTCFullYear()
  const month = date.getUTCMonth()
  const startYear = month >= 6 ? year : year - 1
  return `${startYear}${startYear + 1}`
}

export const selectRelevantGame = (
  schedule: NhlScheduleResponse,
  dateKey: string,
  now: Date,
): NhlScheduleGame | null => {
  const games = schedule.games ?? []
  const todayGames = games.filter((game) => game.gameDate === dateKey)

  if (todayGames.length > 0) {
    return [...todayGames].sort(
      (left, right) =>
        parseStartTime(left.startTimeUTC) - parseStartTime(right.startTimeUTC),
    )[0]
  }

  const nowTime = now.getTime()
  const upcoming = games.filter(
    (game) => parseStartTime(game.startTimeUTC) >= nowTime,
  )

  if (upcoming.length === 0) {
    return null
  }

  return [...upcoming].sort(
    (left, right) =>
      parseStartTime(left.startTimeUTC) - parseStartTime(right.startTimeUTC),
  )[0]
}

export const toGameState = (
  game: NhlScheduleGame,
  landing: NhlLandingResponse | null,
  sourceUpdatedAt: string,
): GameState => {
  const gameId = String(game.id ?? landing?.id ?? '')
  const startTime = game.startTimeUTC ?? landing?.startTimeUTC ?? ''

  if (!gameId) {
    throw new Error('Unable to determine gameId from NHL data.')
  }

  if (!startTime) {
    throw new Error(`Missing startTimeUTC for game ${gameId}.`)
  }

  const status = mapGameStatus(landing?.gameState ?? game.gameState)
  const homeTeam = game.homeTeam ?? landing?.homeTeam
  const awayTeam = game.awayTeam ?? landing?.awayTeam
  const isHome = homeTeam?.abbrev === bruinsAbbrev
  const opponent = isHome ? awayTeam : homeTeam
  const opponentName = getTeamName(opponent)
  const scoreHomeValue = coerceNumber(
    landing?.homeTeam?.score ?? homeTeam?.score,
  )
  const scoreAwayValue = coerceNumber(
    landing?.awayTeam?.score ?? awayTeam?.score,
  )
  const scoreHome = status === 'scheduled' ? null : scoreHomeValue
  const scoreAway = status === 'scheduled' ? null : scoreAwayValue
  const period =
    status === 'scheduled' ? null : (landing?.periodDescriptor?.number ?? null)
  const clock =
    status === 'live' ? (landing?.clock?.timeRemaining ?? null) : null

  return {
    gameId,
    startTime,
    status,
    opponentName,
    isHome,
    scoreHome,
    scoreAway,
    period,
    clock,
    sourceUpdatedAt,
  }
}
