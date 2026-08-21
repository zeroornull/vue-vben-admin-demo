export type ThemeMode = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

export const themeModes: ThemeMode[] = ['system', 'light', 'dark']

export const themeModeLabels: Record<ThemeMode, string> = {
  dark: '深色',
  light: '浅色',
  system: '跟随系统',
}

export function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system'
}

export function normalizeThemeMode(value: unknown): ThemeMode {
  return isThemeMode(value) ? value : 'system'
}

export function resolveTheme(mode: ThemeMode, systemDark: boolean): ResolvedTheme {
  if (mode === 'system') return systemDark ? 'dark' : 'light'
  return mode
}

export function nextThemeMode(mode: ThemeMode): ThemeMode {
  const index = themeModes.indexOf(mode)
  return themeModes[(index + 1) % themeModes.length] ?? 'system'
}

export function applyThemeDataset(root: { dataset: DOMStringMap }, mode: ThemeMode) {
  root.dataset.theme = mode
}

export function readStoredThemeMode(raw: string | null): ThemeMode {
  if (!raw) return 'system'
  try {
    const parsed = JSON.parse(raw) as { themeMode?: unknown }
    return normalizeThemeMode(parsed.themeMode)
  } catch {
    return 'system'
  }
}
