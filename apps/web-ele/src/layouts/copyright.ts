export const COPYRIGHT_START_YEAR = 2026

export function copyrightYears(startYear: number, nowYear: number): string {
  const start = Math.trunc(startYear)
  const now = Math.trunc(nowYear)
  if (!Number.isFinite(start) || start < 1) {
    return Number.isFinite(now) && now >= 1 ? String(now) : String(COPYRIGHT_START_YEAR)
  }
  if (!Number.isFinite(now) || now <= start) return String(start)
  return `${start}–${now}`
}

export function copyrightLine(appName: string, startYear: number, nowYear: number): string {
  const name = appName.trim() || 'Vue Admin'
  return `© ${copyrightYears(startYear, nowYear)} ${name}`
}
