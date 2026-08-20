export const MIN_BAR_VISIBLE_MS = 240

export function nextPending(count: number, delta: number): number {
  return Math.max(0, count + delta)
}

export function shouldTrackLoading(config: { skipLoadingBar?: boolean } | undefined): boolean {
  return !config?.skipLoadingBar
}

export function hideDelayMs(
  shownAt: number,
  now: number,
  minMs = MIN_BAR_VISIBLE_MS,
): number {
  return Math.max(0, shownAt + minMs - now)
}
