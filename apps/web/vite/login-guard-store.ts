import {
  emptyLoginGuard,
  loginGuardKey,
  type LoginGuard,
} from '../src/auth/login-lock.ts'

const guards = new Map<string, LoginGuard>()

export function readLoginGuard(username: string): LoginGuard {
  const key = loginGuardKey(username)
  if (!key) return emptyLoginGuard()
  return guards.get(key) ?? emptyLoginGuard()
}

export function writeLoginGuard(username: string, guard: LoginGuard) {
  const key = loginGuardKey(username)
  if (!key) return
  if (!guard.failed && !guard.lockedUntil) {
    guards.delete(key)
    return
  }
  guards.set(key, guard)
}
