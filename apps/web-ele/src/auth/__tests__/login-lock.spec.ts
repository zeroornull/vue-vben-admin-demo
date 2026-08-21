import { describe, expect, it } from 'vitest'

import {
  emptyLoginGuard,
  isLoginLocked,
  loginLockMessage,
  loginLockWaitSec,
  onLoginFailure,
  onLoginSuccess,
  remainingLoginAttempts,
  wrongPasswordMessage,
} from '../login-lock'

describe('login lockout', () => {
  it('locks on the third failure and does not extend while locked', () => {
    const first = onLoginFailure(emptyLoginGuard(), 0)
    const second = onLoginFailure(first, 0)
    const locked = onLoginFailure(second, 1_000)
    expect(remainingLoginAttempts(first.failed)).toBe(2)
    expect(remainingLoginAttempts(second.failed)).toBe(1)
    expect(isLoginLocked(locked, 1_000)).toBe(true)
    expect(isLoginLocked(locked, 61_000)).toBe(false)
    expect(onLoginFailure(locked, 2_000)).toEqual(locked)
    expect(loginLockWaitSec(1_500, 0)).toBe(2)
    expect(loginLockMessage(locked, 1_000)).toBe('账号已锁定，请 60 秒后再试')
    expect(wrongPasswordMessage(first)).toBe('账号或密码错误，还可试 2 次')
  })

  it('clears the guard after a successful login', () => {
    const failed = onLoginFailure(emptyLoginGuard(), 0)
    expect(onLoginSuccess()).toEqual(emptyLoginGuard())
    expect(isLoginLocked(failed, 0)).toBe(false)
  })
})
