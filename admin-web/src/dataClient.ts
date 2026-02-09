import type { PublicConfig, TodayState } from './types'

export type SetChannelOverrideInput = {
  dateKey: string
  channelOverride: string
  channelOverrideNote: string | null
}

export type DataClient = {
  getPublicConfig: () => Promise<PublicConfig>
  getTodayState: () => Promise<TodayState>
  setChannelOverride: (input: SetChannelOverrideInput) => Promise<void>
  clearChannelOverride: (dateKey: string) => Promise<void>
}

const fallbackConfig: PublicConfig = {
  teamId: 'bruins',
  defaultChannel: '91',
  channelLabel: 'SiriusXM',
  timezone: 'America/New_York',
}

const fallbackToday: TodayState = {
  dateKey: '2026-02-08',
  gameId: null,
  effectiveChannel: '91',
  channelOverride: null,
  channelOverrideNote: null,
}

export const dataClient: DataClient = {
  async getPublicConfig() {
    return fallbackConfig
  },
  async getTodayState() {
    return fallbackToday
  },
  async setChannelOverride() {},
  async clearChannelOverride() {},
}
