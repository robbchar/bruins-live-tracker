export type PublicConfig = {
  teamId: string
  defaultChannel: string
  channelLabel: string
  timezone: string
}

export type TodayState = {
  dateKey: string
  gameId: string | null
  effectiveChannel: string
  channelOverride: string | null
  channelOverrideNote: string | null
}
