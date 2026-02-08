export const computeEffectiveChannel = (
  defaultChannel: string,
  channelOverride?: string | null,
): string => {
  const trimmedOverride = channelOverride?.trim()
  if (trimmedOverride) {
    return trimmedOverride
  }

  return defaultChannel
}
