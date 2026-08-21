export const SIDEBAR_WIDTH_DEFAULT = 220
export const SIDEBAR_WIDTH_MIN = 180
export const SIDEBAR_WIDTH_MAX = 360
export const SIDEBAR_WIDTH_STEP = 8

export function clampSidebarWidth(value: number): number {
  return Math.min(SIDEBAR_WIDTH_MAX, Math.max(SIDEBAR_WIDTH_MIN, value))
}

export function normalizeSidebarWidth(value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(parsed)) return SIDEBAR_WIDTH_DEFAULT
  return clampSidebarWidth(Math.round(parsed))
}

export function sidebarWidthFromDrag(startWidth: number, startX: number, clientX: number): number {
  return clampSidebarWidth(startWidth + (clientX - startX))
}

export function sidebarWidthByKey(current: number, key: string): number | null {
  if (key === 'ArrowLeft') return clampSidebarWidth(current - SIDEBAR_WIDTH_STEP)
  if (key === 'ArrowRight') return clampSidebarWidth(current + SIDEBAR_WIDTH_STEP)
  if (key === 'Home') return SIDEBAR_WIDTH_MIN
  if (key === 'End') return SIDEBAR_WIDTH_MAX
  return null
}

export function readStoredSidebarWidth(raw: string | null): number {
  if (!raw) return SIDEBAR_WIDTH_DEFAULT
  try {
    const parsed = JSON.parse(raw) as { sidebarWidth?: unknown }
    return normalizeSidebarWidth(parsed.sidebarWidth)
  } catch {
    return SIDEBAR_WIDTH_DEFAULT
  }
}
