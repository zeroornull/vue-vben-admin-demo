export type AppLocale = 'zh-CN' | 'en-US'

export const appLocales: AppLocale[] = ['zh-CN', 'en-US']

export function isAppLocale(value: unknown): value is AppLocale {
  return value === 'zh-CN' || value === 'en-US'
}

export function normalizeLocale(value: unknown): AppLocale {
  return isAppLocale(value) ? value : 'zh-CN'
}

export function nextLocale(locale: AppLocale): AppLocale {
  const index = appLocales.indexOf(locale)
  return appLocales[(index + 1) % appLocales.length] ?? 'zh-CN'
}

export function applyHtmlLang(root: { lang: string }, locale: AppLocale) {
  root.lang = locale
}

export function readStoredLocale(raw: string | null): AppLocale {
  if (!raw) return 'zh-CN'
  try {
    const parsed = JSON.parse(raw) as { locale?: unknown }
    return normalizeLocale(parsed.locale)
  } catch {
    return 'zh-CN'
  }
}
