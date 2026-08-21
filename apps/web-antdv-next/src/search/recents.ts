import { filterSearchItems, type AccessMenuItem } from '../router/access-menu'

export const SEARCH_RECENT_MAX = 8

export type SearchRecent = {
  name: string
  path?: string
}

export type SearchRecentMap = Record<string, SearchRecent[]>

export function searchRecentKey(item: { name: string; path?: string }): string {
  return item.path ? `path:${item.path}` : `name:${item.name}`
}

export function toSearchRecent(item: { name?: unknown; path?: unknown }): SearchRecent | null {
  const name = String(item.name ?? '').trim()
  const path = String(item.path ?? '').trim()
  if (!name && !path) return null
  return path ? { name: name || path, path } : { name }
}

export function rememberSearchRecent(
  map: SearchRecentMap,
  username: string,
  item: { name: string; path?: string },
  max = SEARCH_RECENT_MAX,
): SearchRecentMap {
  const owner = username.trim()
  const recent = toSearchRecent(item)
  if (!owner || !recent) return map
  const key = searchRecentKey(recent)
  const current = Array.isArray(map[owner]) ? map[owner] : []
  const next = [recent, ...current.filter((row) => searchRecentKey(row) !== key)].slice(0, max)
  return { ...map, [owner]: next }
}

export function normalizeSearchRecents(value: unknown): SearchRecentMap {
  if (!value || typeof value !== 'object') return {}
  const next: SearchRecentMap = {}
  for (const [user, rows] of Object.entries(value as Record<string, unknown>)) {
    if (!user.trim() || !Array.isArray(rows)) continue
    const list: SearchRecent[] = []
    const seen = new Set<string>()
    for (const row of rows) {
      if (!row || typeof row !== 'object') continue
      const recent = toSearchRecent(row as SearchRecent)
      if (!recent) continue
      const key = searchRecentKey(recent)
      if (seen.has(key)) continue
      seen.add(key)
      list.push(recent)
      if (list.length >= SEARCH_RECENT_MAX) break
    }
    if (list.length) next[user] = list
  }
  return next
}

export function visibleSearchRecents(
  stored: SearchRecent[] | undefined,
  allowed: readonly AccessMenuItem[],
): AccessMenuItem[] {
  if (!stored?.length) return []
  const byKey = new Map(allowed.map((item) => [searchRecentKey(item), item]))
  const hits: AccessMenuItem[] = []
  for (const row of stored) {
    const item = byKey.get(searchRecentKey(row))
    if (item) hits.push(item)
  }
  return hits
}

export function searchListWithoutRecents(
  items: AccessMenuItem[],
  keyword: string,
  recents: readonly AccessMenuItem[],
): AccessMenuItem[] {
  const hits = filterSearchItems(items, keyword)
  if (keyword.trim()) return hits
  const recentKeys = new Set(recents.map(searchRecentKey))
  return hits.filter((item) => !recentKeys.has(searchRecentKey(item)))
}

export function firstSearchHit(
  keyword: string,
  recents: readonly AccessMenuItem[],
  rest: readonly AccessMenuItem[],
): AccessMenuItem | undefined {
  if (keyword.trim()) return rest[0]
  return recents[0] ?? rest[0]
}
