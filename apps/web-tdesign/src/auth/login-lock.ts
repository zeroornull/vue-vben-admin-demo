export const LOGIN_FAIL_MAX = 3
export const LOGIN_LOCK_MS = 60_000

export type LoginGuard = {
  failed: number
  lockedUntil: number
}

export function emptyLoginGuard(): LoginGuard {
  return { failed: 0, lockedUntil: 0 }
}

export function loginGuardKey(username: string): string {
  return username.trim()
}

export function isLoginLocked(guard: LoginGuard, now: number): boolean {
  return guard.lockedUntil > now
}

export function loginLockWaitSec(lockedUntil: number, now: number): number {
  return Math.max(0, Math.ceil((lockedUntil - now) / 1000))
}

export function loginLockMessage(guard: LoginGuard, now: number): string {
  return `账号已锁定，请 ${loginLockWaitSec(guard.lockedUntil, now)} 秒后再试`
}

export function remainingLoginAttempts(failed: number, max = LOGIN_FAIL_MAX): number {
  return Math.max(0, max - failed)
}

export function wrongPasswordMessage(guard: LoginGuard, max = LOGIN_FAIL_MAX): string {
  const left = remainingLoginAttempts(guard.failed, max)
  return `账号或密码错误，还可试 ${left} 次`
}

export function onLoginFailure(
  guard: LoginGuard,
  now: number,
  max = LOGIN_FAIL_MAX,
  lockMs = LOGIN_LOCK_MS,
): LoginGuard {
  if (isLoginLocked(guard, now)) return guard
  const failed = guard.failed + 1
  if (failed >= max) {
    return { failed: 0, lockedUntil: now + lockMs }
  }
  return { failed, lockedUntil: 0 }
}

export function onLoginSuccess(): LoginGuard {
  return emptyLoginGuard()
}
