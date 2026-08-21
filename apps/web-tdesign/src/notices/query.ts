export type Notice = {
  body: string
  createdAt: string
  href: string | null
  id: string
  title: string
}

export type NoticeInbox = {
  items: Notice[]
  readIds: string[]
}

export function noticeHref(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return null
  if (trimmed.includes('\\') || trimmed.includes('#') || trimmed.includes('://')) return null
  const path = trimmed.split('?')[0] ?? ''
  if (!path.startsWith('/') || path.startsWith('//')) return null
  return trimmed
}

export function noticePath(href: string): string {
  return href.split('?')[0] ?? href
}

export function layoutRoutePath(routePath: string): string {
  if (routePath === '' || routePath === '/') return '/'
  return routePath.startsWith('/') ? routePath : `/${routePath}`
}

export function noticeMatchesRoute(href: string, routePath: string): boolean {
  return noticePath(href) === layoutRoutePath(routePath)
}

export function sortNotices(items: Notice[]): Notice[] {
  return [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function unreadNotices(items: Notice[], readIds: string[]): Notice[] {
  const read = new Set(readIds)
  return items.filter((item) => !read.has(item.id))
}

export function unreadCount(items: Notice[], readIds: string[]): number {
  return unreadNotices(items, readIds).length
}

export function noticeBadge(count: number): string {
  if (count <= 0) return ''
  if (count > 9) return '9+'
  return String(count)
}

export function markNoticeRead(readIds: string[], id: string): string[] {
  if (!id || readIds.includes(id)) return readIds
  return [...readIds, id]
}

export function markAllNoticesRead(readIds: string[], items: Notice[]): string[] {
  const next = new Set(readIds)
  for (const item of items) next.add(item.id)
  return [...next]
}

export function noticeTimeLabel(createdAt: string): string {
  return createdAt.slice(0, 10)
}
