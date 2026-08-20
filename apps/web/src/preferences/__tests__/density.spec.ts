import { describe, expect, it } from 'vitest'

import {
  antdComponentSize,
  nextDensity,
  normalizeDensity,
  readStoredDensity,
} from '../density'

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

describe('antdComponentSize', () => {
  it('maps chrome density to ConfigProvider size', () => {
    expect(antdComponentSize('comfortable')).toBe('middle')
    expect(antdComponentSize('compact')).toBe('small')
  })
})

describe('readStoredDensity', () => {
  it('reads the pinia persist payload', () => {
    expect(readStoredDensity(null)).toBe('comfortable')
    expect(readStoredDensity('{')).toBe('comfortable')
    expect(readStoredDensity('{"themeMode":"dark","density":"compact"}')).toBe('compact')
  })
})
