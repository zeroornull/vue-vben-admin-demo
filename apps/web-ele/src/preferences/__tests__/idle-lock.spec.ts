import { describe, expect, it } from 'vitest'

import {
  idleLockAfterMs,
  nextIdleLockMinutes,
  normalizeIdleLockMinutes,
  shouldLockOnIdle,
} from '../idle-lock'

describe('idle lock preference', () => {
  it('falls back to off and cycles 1 minute then 15', () => {
    expect(normalizeIdleLockMinutes('nope')).toBe(0)
    expect(normalizeIdleLockMinutes('1')).toBe(1)
    expect(nextIdleLockMinutes(0)).toBe(1)
    expect(nextIdleLockMinutes(1)).toBe(15)
    expect(nextIdleLockMinutes(15)).toBe(0)
    expect(idleLockAfterMs(1)).toBe(60_000)
  })

  it('locks only after the idle window, and never when already locked or off', () => {
    expect(
      shouldLockOnIdle({ lastActivityAt: 0, locked: false, minutes: 1, now: 59_999 }),
    ).toBe(false)
    expect(
      shouldLockOnIdle({ lastActivityAt: 0, locked: false, minutes: 1, now: 60_000 }),
    ).toBe(true)
    expect(
      shouldLockOnIdle({ lastActivityAt: 0, locked: true, minutes: 1, now: 60_000 }),
    ).toBe(false)
    expect(
      shouldLockOnIdle({ lastActivityAt: 0, locked: false, minutes: 0, now: 120_000 }),
    ).toBe(false)
  })
})
