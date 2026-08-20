import { describe, expect, it, vi } from 'vitest'

import {
  isSessionClearMessage,
  publishSessionClear,
  SESSION_CLEAR_TYPE,
  shouldApplyRemoteSessionClear,
  shouldPublishSessionClear,
} from '../session-broadcast'

describe('isSessionClearMessage / shouldPublishSessionClear', () => {
  it('accepts only clear-session and publishes when this tab had a token', () => {
    expect(isSessionClearMessage({ type: SESSION_CLEAR_TYPE })).toBe(true)
    expect(isSessionClearMessage({ type: 'login' })).toBe(false)
    expect(isSessionClearMessage(null)).toBe(false)
    expect(shouldPublishSessionClear(true)).toBe(true)
    expect(shouldPublishSessionClear(false)).toBe(false)
    expect(shouldPublishSessionClear(true, { broadcast: false })).toBe(false)
    expect(shouldApplyRemoteSessionClear('mock.vben')).toBe(true)
    expect(shouldApplyRemoteSessionClear('')).toBe(false)
  })
})

describe('publishSessionClear', () => {
  it('posts the typed payload through the injected sender', () => {
    const send = vi.fn()
    publishSessionClear(send)
    expect(send).toHaveBeenCalledWith({ type: SESSION_CLEAR_TYPE })
  })
})
