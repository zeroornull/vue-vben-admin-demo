export const TABLE_PAGE_KEYS = ['users', 'roles', 'links', 'audit'] as const

export type TablePageKey = (typeof TABLE_PAGE_KEYS)[number]

export const TABLE_PAGE_SIZES = [10, 20, 50, 100] as const

export type TablePageSize = (typeof TABLE_PAGE_SIZES)[number]

export const TABLE_PAGE_SIZE_DEFAULT: TablePageSize = 10

export const TABLE_PAGE_SIZE_OPTIONS = TABLE_PAGE_SIZES.map(String)

export type TablePageSizes = Record<TablePageKey, TablePageSize>

export function emptyTablePageSizes(): TablePageSizes {
  return {
    audit: TABLE_PAGE_SIZE_DEFAULT,
    links: TABLE_PAGE_SIZE_DEFAULT,
    roles: TABLE_PAGE_SIZE_DEFAULT,
    users: TABLE_PAGE_SIZE_DEFAULT,
  }
}

export function isTablePageKey(value: unknown): value is TablePageKey {
  return TABLE_PAGE_KEYS.some((key) => key === value)
}

export function isTablePageSize(value: unknown): value is TablePageSize {
  return TABLE_PAGE_SIZES.some((size) => size === value)
}

export function normalizeTablePageSize(value: unknown): TablePageSize {
  const parsed = typeof value === 'number' ? value : Number(value)
  return isTablePageSize(parsed) ? parsed : TABLE_PAGE_SIZE_DEFAULT
}

export function normalizeTablePageSizes(value: unknown): TablePageSizes {
  const current = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  const next = emptyTablePageSizes()
  for (const key of TABLE_PAGE_KEYS) {
    next[key] = normalizeTablePageSize(current[key])
  }
  return next
}

export function nextTablePage(
  currentPage: number,
  currentSize: TablePageSize,
  incomingPage: unknown,
  incomingSize: unknown,
): { page: number; pageSize: TablePageSize } {
  const pageSize =
    incomingSize === undefined || incomingSize === null
      ? currentSize
      : normalizeTablePageSize(incomingSize)
  if (pageSize !== currentSize) {
    return { page: 1, pageSize }
  }
  const page = Math.max(1, Math.round(Number(incomingPage)) || currentPage || 1)
  return { page, pageSize }
}
