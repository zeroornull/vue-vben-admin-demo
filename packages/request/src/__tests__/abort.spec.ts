import { describe, expect, it } from 'vitest'

import {
  isCanceledError,
  pageAbortSignal,
  shouldAttachPageAbort,
  shouldRotatePageAbort,
  withPageAbort,
} from '../abort.ts'

describe('shouldRotatePageAbort / shouldAttachPageAbort', () => {
  it('rotates only when the path changes and skips explicit signals', () => {
    expect(shouldRotatePageAbort('/users', '/roles')).toBe(true)
    expect(shouldRotatePageAbort('/users', '/users')).toBe(false)
    expect(shouldAttachPageAbort(undefined)).toBe(true)
    expect(shouldAttachPageAbort({ skipAbort: true })).toBe(false)
    expect(shouldAttachPageAbort({ signal: pageAbortSignal() })).toBe(false)
  })
})

describe('isCanceledError / withPageAbort', () => {
  it('recognizes axios cancel and keeps skip flags when attaching', () => {
    expect(isCanceledError({ code: 'ERR_CANCELED' })).toBe(true)
    expect(isCanceledError({ name: 'AbortError' })).toBe(true)
    expect(isCanceledError(new Error('挂了'))).toBe(false)
    const attached = withPageAbort({ skipLoadingBar: true })
    expect(attached.signal).toBe(pageAbortSignal())
    expect(attached.skipLoadingBar).toBe(true)
    expect(withPageAbort({ skipAbort: true }).signal).toBeUndefined()
  })
})
