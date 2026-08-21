export type WatermarkUser = {
  realName: string
  username: string
}

export function escapeXml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

export function watermarkText(user: WatermarkUser | null | undefined): string {
  if (!user?.username) return ''
  const name = user.realName.trim()
  if (!name || name === user.username) return user.username
  return `${name} · ${user.username}`
}

export function shouldShowWatermark(enabled: boolean, text: string): boolean {
  return enabled && text.length > 0
}

export function watermarkTileUrl(text: string, dark: boolean): string {
  if (!text) return ''
  const fill = dark ? 'rgba(255,255,255,0.09)' : 'rgba(44,62,80,0.11)'
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200" viewBox="0 0 320 200">` +
    `<text x="160" y="100" fill="${fill}" font-size="14" font-family="system-ui,sans-serif" ` +
    `text-anchor="middle" transform="rotate(-22 160 100)">${escapeXml(text)}</text></svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}
