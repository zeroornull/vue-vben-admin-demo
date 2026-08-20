export type IdleLockMinutes = 0 | 1 | 15

export const idleLockMinutesList: IdleLockMinutes[] = [0, 1, 15]

export const idleLockLabels: Record<IdleLockMinutes, string> = {
  0: '闲置关',
  1: '1 分钟',
  15: '15 分钟',
}

export function isIdleLockMinutes(value: unknown): value is IdleLockMinutes {
  return value === 0 || value === 1 || value === 15
}

export function normalizeIdleLockMinutes(value: unknown): IdleLockMinutes {
  if (value === 0 || value === '0') return 0
  if (value === 1 || value === '1') return 1
  if (value === 15 || value === '15') return 15
  return 0
}

export function nextIdleLockMinutes(value: IdleLockMinutes): IdleLockMinutes {
  const index = idleLockMinutesList.indexOf(value)
  return idleLockMinutesList[(index + 1) % idleLockMinutesList.length] ?? 0
}

export function idleLockAfterMs(minutes: IdleLockMinutes): number {
  return minutes * 60_000
}

export function shouldLockOnIdle(input: {
  lastActivityAt: number
  locked: boolean
  minutes: IdleLockMinutes
  now: number
}): boolean {
  if (input.locked || input.minutes === 0) return false
  return input.now - input.lastActivityAt >= idleLockAfterMs(input.minutes)
}
