export function shouldRotatePageAbort(fromPath: string, toPath: string): boolean {
  return fromPath !== toPath
}

export function shouldAttachPageAbort(config?: {
  signal?: unknown
  skipAbort?: boolean
}): boolean {
  return !config?.skipAbort && config?.signal === undefined
}

export function isCanceledError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const code = 'code' in error ? error.code : undefined
  const name = 'name' in error ? error.name : undefined
  return code === 'ERR_CANCELED' || name === 'CanceledError' || name === 'AbortError'
}

let controller = new AbortController()

export function pageAbortSignal(): AbortSignal {
  return controller.signal
}

export function rotatePageAbort(): AbortSignal {
  controller.abort()
  controller = new AbortController()
  return controller.signal
}

export function withPageAbort<T extends { signal?: unknown; skipAbort?: boolean }>(
  config?: T,
): T {
  if (!shouldAttachPageAbort(config)) return { ...(config as T) }
  return { ...(config as T), signal: pageAbortSignal() }
}
