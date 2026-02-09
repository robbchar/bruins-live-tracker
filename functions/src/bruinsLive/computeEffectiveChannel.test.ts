import { describe, expect, it } from 'vitest'
import { computeEffectiveChannel } from './computeEffectiveChannel.js'

describe('computeEffectiveChannel', () => {
  it('returns the override when provided', () => {
    expect(computeEffectiveChannel('91', '92')).toBe('92')
  })

  it('trims the override before returning it', () => {
    expect(computeEffectiveChannel('91', '  93 ')).toBe('93')
  })

  it('falls back to the default when override is empty', () => {
    expect(computeEffectiveChannel('91', '   ')).toBe('91')
  })
})
