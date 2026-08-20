import { describe, expect, it } from 'vitest'

import { errorToastText, requestError, shouldAnnounceError } from '../toast'

describe('errorToastText', () => {
  it('uses the error message or a fallback', () => {
    expect(errorToastText(new Error('挂了'))).toBe('挂了')
    expect(errorToastText(new Error('  '))).toBe('请求失败')
    expect(errorToastText('nope')).toBe('请求失败')
  })
})

describe('shouldAnnounceError', () => {
  it('skips when the call or the error asks to', () => {
    expect(shouldAnnounceError(new Error('挂了'), undefined)).toBe(true)
    expect(shouldAnnounceError(new Error('挂了'), { skipErrorToast: true })).toBe(false)
    expect(shouldAnnounceError(requestError('未登录或登录已过期', true), {})).toBe(false)
  })
})
