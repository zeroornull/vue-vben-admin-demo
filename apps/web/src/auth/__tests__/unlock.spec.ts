import { describe, expect, it } from 'vitest'

import { passwordsMatch, readUnlockPassword } from '../unlock'

describe('readUnlockPassword / passwordsMatch', () => {
  it('only accepts a string password', () => {
    expect(readUnlockPassword('123456')).toBe('123456')
    expect(readUnlockPassword(123456)).toBe('')
    expect(readUnlockPassword(null)).toBe('')
  })

  it('compares exact text, no trim', () => {
    expect(passwordsMatch('123456', '123456')).toBe(true)
    expect(passwordsMatch(' 123456', '123456')).toBe(false)
    expect(passwordsMatch('', '123456')).toBe(false)
  })
})
