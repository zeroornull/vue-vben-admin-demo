export const TABLE_EXPAND_KEYS = ['depts'] as const

export type TableExpandKey = (typeof TABLE_EXPAND_KEYS)[number]

export type TableExpandState = Record<TableExpandKey, string[] | null>

export function emptyTableExpandState(): TableExpandState {
  return { depts: null }
}

export function isTableExpandKey(value: unknown): value is TableExpandKey {
  return TABLE_EXPAND_KEYS.some((key) => key === value)
}

export function normalizeExpandKeys(stored: unknown, validIds: readonly string[]): string[] {
  const allowed = new Set(validIds)
  if (!Array.isArray(stored)) return [...validIds]
  return stored.filter((item): item is string => typeof item === 'string' && allowed.has(item))
}

export function normalizeTableExpandState(value: unknown): TableExpandState {
  const current = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  const next = emptyTableExpandState()
  for (const key of TABLE_EXPAND_KEYS) {
    const raw = current[key]
    next[key] = raw === null || raw === undefined ? null : Array.isArray(raw) ? [...raw] : null
  }
  return next
}

export function mergeExpandedKeys(
  incoming: readonly unknown[],
  visibleIds: readonly string[],
  stored: string[] | null,
  allIds: readonly string[],
): string[] {
  const visible = new Set(visibleIds)
  const allowed = new Set(allIds)
  const previous = stored == null ? allIds : stored
  const keptHidden = previous.filter((id) => allowed.has(id) && !visible.has(id))
  const nextVisible = incoming.filter(
    (item): item is string => typeof item === 'string' && visible.has(item),
  )
  return [...new Set([...keptHidden, ...nextVisible])]
}
