export type Density = 'comfortable' | 'compact'

export type AntdComponentSize = 'middle' | 'small'

export const densities: Density[] = ['comfortable', 'compact']

export const densityLabels: Record<Density, string> = {
  comfortable: '舒适',
  compact: '紧凑',
}

export function isDensity(value: unknown): value is Density {
  return value === 'comfortable' || value === 'compact'
}

export function normalizeDensity(value: unknown): Density {
  return isDensity(value) ? value : 'comfortable'
}

export function nextDensity(density: Density): Density {
  const index = densities.indexOf(density)
  return densities[(index + 1) % densities.length] ?? 'comfortable'
}

export function antdComponentSize(density: Density): AntdComponentSize {
  return density === 'compact' ? 'small' : 'middle'
}

export function applyDensityDataset(root: { dataset: DOMStringMap }, density: Density) {
  root.dataset.density = density
}

export function readStoredDensity(raw: string | null): Density {
  if (!raw) return 'comfortable'
  try {
    const parsed = JSON.parse(raw) as { density?: unknown }
    return normalizeDensity(parsed.density)
  } catch {
    return 'comfortable'
  }
}
