import { describe, expect, it } from 'vitest'

import { COPYRIGHT_START_YEAR, copyrightLine, copyrightYears } from '../copyright'

describe('copyrightYears', () => {
  it('uses a single year until the next one', () => {
    expect(copyrightYears(2026, 2026)).toBe('2026')
    expect(copyrightYears(2026, 2025)).toBe('2026')
    expect(copyrightYears(2026, 2028)).toBe('2026–2028')
  })

  it('falls back when the start year is unusable', () => {
    expect(copyrightYears(Number.NaN, 2028)).toBe('2028')
    expect(copyrightYears(0, Number.NaN)).toBe(String(COPYRIGHT_START_YEAR))
  })
})

describe('copyrightLine', () => {
  it('joins the mark, years, and app name', () => {
    expect(copyrightLine('Vue Admin', 2026, 2026)).toBe('© 2026 Vue Admin')
    expect(copyrightLine('  ', 2026, 2027)).toBe('© 2026–2027 Vue Admin')
  })
})
