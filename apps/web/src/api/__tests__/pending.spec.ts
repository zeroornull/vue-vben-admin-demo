import { describe, expect, it } from 'vitest'

import { hideDelayMs, nextPending, shouldTrackLoading } from '../pending'

describe('nextPending', () => {
  it('counts up and never goes below zero', () => {
    expect(nextPending(0, 1)).toBe(1)
    expect(nextPending(2, -1)).toBe(1)
    expect(nextPending(0, -1)).toBe(0)
  })
})

describe('shouldTrackLoading', () => {
  it('skips only when asked', () => {
    expect(shouldTrackLoading(undefined)).toBe(true)
    expect(shouldTrackLoading({})).toBe(true)
    expect(shouldTrackLoading({ skipLoadingBar: true })).toBe(false)
  })
})

describe('hideDelayMs', () => {
  it('keeps a short request visible', () => {
    expect(hideDelayMs(1000, 1100, 240)).toBe(140)
  })

  it('hides immediately after a long request', () => {
    expect(hideDelayMs(1000, 1400, 240)).toBe(0)
  })
})
