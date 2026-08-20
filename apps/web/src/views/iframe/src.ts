export const IFRAME_SANDBOX = 'allow-scripts allow-popups allow-forms'

export function iframeReloadKey(src: string, epoch: number): string {
  return `${src}#${epoch}`
}

export function canOpenIframeExternally(src: string | null): boolean {
  if (!src) return false
  if (src.startsWith('/') && !src.startsWith('//')) return true
  return src.startsWith('https://') || src.startsWith('http://')
}

export function safeIframeSrc(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    if (trimmed.includes('\\')) return null
    return trimmed
  }
  try {
    const url = new URL(trimmed)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
    if (url.username || url.password) return null
    return url.href
  } catch {
    return null
  }
}
