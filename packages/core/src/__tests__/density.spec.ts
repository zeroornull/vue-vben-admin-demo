import { describe, expect, it } from 'vitest'

import { applyDensityDataset, nextDensity, normalizeDensity, readStoredDensity } from '../density.ts'

describe('normalizeDensity / nextDensity', () => {
  it('falls back to comfortable', () => {
    expect(normalizeDensity('nope')).toBe('comfortable')
    expect(normalizeDensity('compact')).toBe('compact')
  })

  it('cycles comfortable → compact → comfortable', () => {
    expect(nextDensity('comfortable')).toBe('compact')
    expect(nextDensity('compact')).toBe('comfortable')
  })
})

describe('readStoredDensity', () => {
  it('reads the pinia persist payload', () => {
    expect(readStoredDensity(null)).toBe('comfortable')
    expect(readStoredDensity('{')).toBe('comfortable')
    expect(readStoredDensity('{"themeMode":"dark","density":"compact"}')).toBe('compact')
  })
})

describe('applyDensityDataset', () => {
  it('writes data-density', () => {
    const root = { dataset: {} as DOMStringMap }
    applyDensityDataset(root, 'compact')
    expect(root.dataset.density).toBe('compact')
  })
})
