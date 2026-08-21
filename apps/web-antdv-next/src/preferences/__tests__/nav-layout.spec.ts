import { describe, expect, it } from 'vitest'

import { nextNavLayout, normalizeNavLayout } from '../nav-layout'

describe('normalizeNavLayout / nextNavLayout', () => {
  it('falls back to sidebar and cycles to top', () => {
    expect(normalizeNavLayout('nope')).toBe('sidebar')
    expect(normalizeNavLayout('top')).toBe('top')
    expect(nextNavLayout('sidebar')).toBe('top')
    expect(nextNavLayout('top')).toBe('sidebar')
  })
})
