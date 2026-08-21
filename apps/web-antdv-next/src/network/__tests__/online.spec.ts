import { describe, expect, it } from 'vitest'

import { readNavigatorOnline, shouldShowOfflineBanner } from '../online'

describe('readNavigatorOnline / shouldShowOfflineBanner', () => {
  it('treats missing navigator as online and only flags an explicit offline', () => {
    expect(readNavigatorOnline(undefined)).toBe(true)
    expect(readNavigatorOnline({})).toBe(true)
    expect(readNavigatorOnline({ onLine: true })).toBe(true)
    expect(readNavigatorOnline({ onLine: false })).toBe(false)
    expect(shouldShowOfflineBanner(true)).toBe(false)
    expect(shouldShowOfflineBanner(false)).toBe(true)
  })
})
