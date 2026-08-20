export type ColorFilter = 'none' | 'weak' | 'gray'

export const colorFilters: ColorFilter[] = ['none', 'weak', 'gray']

export const colorFilterLabels: Record<ColorFilter, string> = {
  gray: '灰色',
  none: '原色',
  weak: '色弱',
}

export function isColorFilter(value: unknown): value is ColorFilter {
  return value === 'none' || value === 'weak' || value === 'gray'
}

export function normalizeColorFilter(value: unknown): ColorFilter {
  return isColorFilter(value) ? value : 'none'
}

export function nextColorFilter(filter: ColorFilter): ColorFilter {
  const index = colorFilters.indexOf(filter)
  return colorFilters[(index + 1) % colorFilters.length] ?? 'none'
}

export function applyColorFilterDataset(root: { dataset: DOMStringMap }, filter: ColorFilter) {
  root.dataset.filter = filter
}

export function readStoredColorFilter(raw: string | null): ColorFilter {
  if (!raw) return 'none'
  try {
    const parsed = JSON.parse(raw) as { colorFilter?: unknown }
    return normalizeColorFilter(parsed.colorFilter)
  } catch {
    return 'none'
  }
}
