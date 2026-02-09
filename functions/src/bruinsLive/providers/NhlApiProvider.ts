import { fetch } from 'undici'
import type {
  NhlLandingResponse,
  NhlScheduleResponse,
  SportsDataProvider,
} from './SportsDataProvider'

const baseUrl = 'https://api-web.nhle.com/v1'

const fetchJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(
      `NHL API request failed: ${response.status} ${response.statusText}`,
    )
  }

  return (await response.json()) as T
}

export class NhlApiProvider implements SportsDataProvider {
  async getSchedule(seasonId: string): Promise<NhlScheduleResponse> {
    const url = `${baseUrl}/club-schedule-season/BOS/${seasonId}`
    return fetchJson<NhlScheduleResponse>(url)
  }

  async getGameLanding(gameId: string): Promise<NhlLandingResponse> {
    const url = `${baseUrl}/gamecenter/${gameId}/landing`
    return fetchJson<NhlLandingResponse>(url)
  }
}
