import { describe, expect, it } from 'vitest'

import { BACK_TOP_THRESHOLD, shouldShowBackTop } from '../back-top'

describe('shouldShowBackTop', () => {
  it('shows only after the threshold', () => {
    expect(shouldShowBackTop(0)).toBe(false)
    expect(shouldShowBackTop(BACK_TOP_THRESHOLD - 1)).toBe(false)
    expect(shouldShowBackTop(BACK_TOP_THRESHOLD)).toBe(true)
    expect(shouldShowBackTop(800, 400)).toBe(true)
  })
})
