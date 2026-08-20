import { describe, expect, it } from 'vitest'

import { RETRY_LIMIT, retryCountOf, shouldRetryRequest } from '../retry'

describe('retryCountOf', () => {
  it('treats missing or junk as zero', () => {
    expect(retryCountOf(undefined)).toBe(0)
    expect(retryCountOf({})).toBe(0)
    expect(retryCountOf({ retryCount: 1 })).toBe(1)
    expect(retryCountOf({ retryCount: Number.NaN })).toBe(0)
  })
})

describe('shouldRetryRequest', () => {
  it('retries a GET 500 once, then stops', () => {
    expect(shouldRetryRequest({ method: 'get', status: 500 })).toBe(true)
    expect(shouldRetryRequest({ method: 'GET', status: 503, retryCount: 0 })).toBe(true)
    expect(
      shouldRetryRequest({ method: 'get', status: 500, retryCount: RETRY_LIMIT }),
    ).toBe(false)
  })

  it('retries a GET with no HTTP status (network / timeout)', () => {
    expect(shouldRetryRequest({ method: 'get' })).toBe(true)
    expect(shouldRetryRequest({ method: 'get', code: 'ECONNABORTED' })).toBe(true)
  })

  it('does not retry writes, 4xx, cancel, or skipRetry', () => {
    expect(shouldRetryRequest({ method: 'post', status: 500 })).toBe(false)
    expect(shouldRetryRequest({ method: 'put', status: 503 })).toBe(false)
    expect(shouldRetryRequest({ method: 'delete', status: 502 })).toBe(false)
    expect(shouldRetryRequest({ method: 'get', status: 401 })).toBe(false)
    expect(shouldRetryRequest({ method: 'get', status: 403 })).toBe(false)
    expect(shouldRetryRequest({ method: 'get', status: 404 })).toBe(false)
    expect(shouldRetryRequest({ method: 'get', status: 400 })).toBe(false)
    expect(shouldRetryRequest({ method: 'get', status: 500, skipRetry: true })).toBe(false)
    expect(shouldRetryRequest({ method: 'get', code: 'ERR_CANCELED' })).toBe(false)
  })
})
