export const RETRY_LIMIT = 1

const RETRYABLE_STATUS = new Set([500, 502, 503, 504])

export function retryCountOf(config: { retryCount?: number } | undefined): number {
  const count = config?.retryCount ?? 0
  return Number.isFinite(count) ? Math.max(0, count) : 0
}

export function shouldRetryRequest(input: {
  code?: string
  method?: string
  retryCount?: number
  skipRetry?: boolean
  status?: number
}): boolean {
  if (input.skipRetry) return false
  if (input.code === 'ERR_CANCELED') return false
  if (retryCountOf(input) >= RETRY_LIMIT) return false
  if ((input.method ?? 'get').toLowerCase() !== 'get') return false
  if (input.status === undefined) return true
  return RETRYABLE_STATUS.has(input.status)
}
