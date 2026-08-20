import { describe, expect, it, vi } from 'vitest'

import {
  isSessionClearMessage,
  isSessionMessage,
  publishSessionClear,
  publishSessionMessage,
  readStoredAccessToken,
  SESSION_ADOPT_TYPE,
  SESSION_CLEAR_TYPE,
  SESSION_LOCK_TYPE,
  shouldAdoptRemoteSession,
  shouldApplyRemoteLock,
  shouldApplyRemoteSessionClear,
  shouldApplyRemoteUnlock,
  shouldPublishSessionClear,
} from '../session-broadcast'

describe('session messages', () => {
  it('accepts the four session types and publishes when this tab had a token', () => {
    expect(isSessionClearMessage({ type: SESSION_CLEAR_TYPE })).toBe(true)
    expect(isSessionMessage({ type: SESSION_LOCK_TYPE })).toBe(true)
    expect(isSessionMessage({ type: SESSION_ADOPT_TYPE })).toBe(true)
    expect(isSessionMessage({ type: 'login' })).toBe(false)
    expect(shouldPublishSessionClear(true)).toBe(true)
    expect(shouldPublishSessionClear(false)).toBe(false)
    expect(shouldPublishSessionClear(true, { broadcast: false })).toBe(false)
    expect(shouldApplyRemoteSessionClear('mock.vben')).toBe(true)
    expect(shouldApplyRemoteLock(false)).toBe(true)
    expect(shouldApplyRemoteLock(true)).toBe(false)
    expect(shouldApplyRemoteUnlock(true)).toBe(true)
    expect(shouldApplyRemoteUnlock(false)).toBe(false)
  })
})

describe('readStoredAccessToken / shouldAdoptRemoteSession', () => {
  it('reads the pinia auth persist payload and skips the same token', () => {
    expect(readStoredAccessToken(null)).toBe('')
    expect(readStoredAccessToken('{')).toBe('')
    expect(readStoredAccessToken('{"accessToken":"mock.admin"}')).toBe('mock.admin')
    expect(shouldAdoptRemoteSession('', 'mock.admin')).toBe(true)
    expect(shouldAdoptRemoteSession('mock.vben', 'mock.admin')).toBe(true)
    expect(shouldAdoptRemoteSession('mock.admin', 'mock.admin')).toBe(false)
    expect(shouldAdoptRemoteSession('mock.vben', '')).toBe(false)
  })
})

describe('publishSessionClear / publishSessionMessage', () => {
  it('posts the typed payload through the injected sender', () => {
    const send = vi.fn()
    publishSessionClear(send)
    expect(send).toHaveBeenCalledWith({ type: SESSION_CLEAR_TYPE })
    publishSessionMessage({ type: SESSION_LOCK_TYPE }, send)
    expect(send).toHaveBeenCalledWith({ type: SESSION_LOCK_TYPE })
  })
})
