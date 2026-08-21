import { isCanceledError } from './abort.ts'

export const TOAST_MS = 4000

export type RequestError = Error & {
  skipToast?: boolean
}

export function requestError(message: string, skipToast = false): RequestError {
  const error = new Error(message) as RequestError
  error.skipToast = skipToast
  return error
}

export function errorToastText(error: unknown): string {
  if (error instanceof Error && error.message.trim()) return error.message
  return '请求失败'
}

export function shouldAnnounceError(
  error: unknown,
  config: { skipErrorToast?: boolean } | undefined,
): boolean {
  if (config?.skipErrorToast) return false
  if (isCanceledError(error)) return false
  return !(error instanceof Error && 'skipToast' in error && error.skipToast)
}
