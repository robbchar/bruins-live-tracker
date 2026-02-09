import { describe, expect, it } from 'vitest'
import { getTodayKey } from './getTodayKey.js'

describe('getTodayKey', () => {
  it('returns the Eastern date key for a UTC timestamp', () => {
    const date = new Date('2026-02-08T03:30:00.000Z')

    expect(getTodayKey('America/New_York', date)).toBe('2026-02-07')
  })

  it('returns the same date when it is midday Eastern', () => {
    const date = new Date('2026-02-08T17:00:00.000Z')

    expect(getTodayKey('America/New_York', date)).toBe('2026-02-08')
  })
})
