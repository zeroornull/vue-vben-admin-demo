import { describe, expect, it } from 'vitest'

import {
  nextColorFilter,
  normalizeColorFilter,
  readStoredColorFilter,
} from '../color-filter'

describe('normalizeColorFilter / nextColorFilter', () => {
  it('falls back to none', () => {
    expect(normalizeColorFilter('nope')).toBe('none')
    expect(normalizeColorFilter('gray')).toBe('gray')
  })

  it('cycles none → weak → gray → none', () => {
    expect(nextColorFilter('none')).toBe('weak')
    expect(nextColorFilter('weak')).toBe('gray')
    expect(nextColorFilter('gray')).toBe('none')
  })
})

describe('readStoredColorFilter', () => {
  it('reads the pinia persist payload', () => {
    expect(readStoredColorFilter(null)).toBe('none')
    expect(readStoredColorFilter('{')).toBe('none')
    expect(readStoredColorFilter('{"themeMode":"dark","colorFilter":"weak"}')).toBe('weak')
  })
})
