export type NhlScheduleTeam = {
  abbrev?: string
  commonName?: {
    default?: string
  }
  placeName?: {
    default?: string
  }
  score?: number
}

export type NhlScheduleGame = {
  id?: number
  gameDate?: string
  startTimeUTC?: string
  gameState?: string
  homeTeam?: NhlScheduleTeam
  awayTeam?: NhlScheduleTeam
}

export type NhlScheduleResponse = {
  currentSeason?: number
  games?: NhlScheduleGame[]
}

export type NhlLandingTeam = {
  abbrev?: string
  commonName?: {
    default?: string
  }
  placeName?: {
    default?: string
  }
  score?: number
}

export type NhlLandingResponse = {
  id?: number
  gameState?: string
  startTimeUTC?: string
  periodDescriptor?: {
    number?: number
    periodType?: string
  }
  clock?: {
    timeRemaining?: string
    running?: boolean
    inIntermission?: boolean
  }
  homeTeam?: NhlLandingTeam
  awayTeam?: NhlLandingTeam
}

export interface SportsDataProvider {
  getSchedule(seasonId: string): Promise<NhlScheduleResponse>
  getGameLanding(gameId: string): Promise<NhlLandingResponse>
}
