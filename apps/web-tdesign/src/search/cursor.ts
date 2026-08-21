export function flattenSearchHits<T>(recents: readonly T[], rest: readonly T[]): T[] {
  return [...recents, ...rest]
}

export function moveSearchCursor(current: number, delta: number, total: number): number {
  if (total <= 0) return -1
  if (current < 0 || current >= total) return delta > 0 ? 0 : total - 1
  return (current + delta + total) % total
}

export function clampSearchCursor(current: number, total: number): number {
  if (total <= 0) return -1
  if (current < 0) return 0
  return Math.min(current, total - 1)
}

export function searchHitAt<T>(list: readonly T[], index: number): T | undefined {
  if (!list.length) return undefined
  return list[index] ?? list[0]
}

export function searchCursorKey(event: { key: string }): -1 | 0 | 1 {
  if (event.key === 'ArrowDown') return 1
  if (event.key === 'ArrowUp') return -1
  return 0
}

export function jumpSearchCursor(key: string, total: number): number | null {
  if (key !== 'Home' && key !== 'End') return null
  if (total <= 0) return -1
  return key === 'Home' ? 0 : total - 1
}

export function searchDigitIndex(key: string, keyword: string, total: number): number | null {
  if (keyword.trim()) return null
  if (key === '0') return total > 9 ? 9 : null
  if (!/^[1-9]$/.test(key)) return null
  const index = Number(key) - 1
  if (index >= total) return null
  return index
}
