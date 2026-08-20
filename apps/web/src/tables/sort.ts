import { nextTablePage, type TablePageKey, type TablePageSize } from './page-size'

export const TABLE_SORT_FIELDS: Record<TablePageKey, readonly string[]> = {
  audit: ['at', 'actor'],
  links: ['title', 'code', 'createTime', 'status'],
  roles: ['name', 'code', 'createTime', 'status'],
  users: ['name', 'createTime', 'status'],
}

export type TableSortOrder = 'ascend' | 'descend'

export type TableSort = {
  field: string
  order: TableSortOrder
}

export type TableSorts = Record<TablePageKey, TableSort | null>

export function emptyTableSorts(): TableSorts {
  return { audit: null, links: null, roles: null, users: null }
}

export function isTableSortOrder(value: unknown): value is TableSortOrder {
  return value === 'ascend' || value === 'descend'
}

export function normalizeTableSort(
  field: unknown,
  order: unknown,
  allowed: readonly string[],
): TableSort | null {
  const name = Array.isArray(field) ? String(field[0] ?? '') : String(field ?? '')
  if (!name || !allowed.includes(name) || !isTableSortOrder(order)) return null
  return { field: name, order }
}

export function parseSortParams(
  search: URLSearchParams,
  allowed: readonly string[],
): { sortField: string; sortOrder: string } {
  const sort = normalizeTableSort(search.get('sortField'), search.get('sortOrder'), allowed)
  return {
    sortField: sort?.field ?? '',
    sortOrder: sort?.order ?? '',
  }
}

export function normalizeTableSorts(value: unknown): TableSorts {
  const current = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  const next = emptyTableSorts()
  for (const key of Object.keys(next) as TablePageKey[]) {
    const row = current[key]
    if (!row || typeof row !== 'object') continue
    const item = row as { field?: unknown; order?: unknown }
    next[key] = normalizeTableSort(item.field, item.order, TABLE_SORT_FIELDS[key])
  }
  return next
}

export function readAntdSorter(sorter: unknown): { field: unknown; order: unknown } {
  const first = Array.isArray(sorter) ? sorter[0] : sorter
  if (!first || typeof first !== 'object') return { field: undefined, order: undefined }
  const row = first as { columnKey?: unknown; field?: unknown; order?: unknown }
  return { field: row.field ?? row.columnKey, order: row.order }
}

export function compareSortValues(left: unknown, right: unknown): number {
  if (left == null && right == null) return 0
  if (left == null) return 1
  if (right == null) return -1
  if (typeof left === 'number' && typeof right === 'number') return left - right
  return String(left).localeCompare(String(right), 'zh')
}

export function sortByTableSort<T>(
  list: readonly T[],
  sort: TableSort | null,
  pick: (item: T, field: string) => unknown,
): T[] {
  if (!sort) return [...list]
  const factor = sort.order === 'ascend' ? 1 : -1
  return [...list].sort(
    (left, right) => factor * compareSortValues(pick(left, sort.field), pick(right, sort.field)),
  )
}

export function sortListByQuery<T extends object>(
  list: readonly T[],
  query: { sortField?: string; sortOrder?: string },
  allowed: readonly string[],
): T[] {
  return sortByTableSort(
    list,
    normalizeTableSort(query.sortField, query.sortOrder, allowed),
    (item, field) => (item as Record<string, unknown>)[field],
  )
}

export function tableColumnSort(
  field: string,
  allowed: readonly string[],
  sort: TableSort | null,
): { sortOrder?: TableSortOrder; sorter?: true } {
  if (!allowed.includes(field)) return {}
  return {
    sorter: true,
    sortOrder: sort?.field === field ? sort.order : undefined,
  }
}

export function nextTableQuery(
  currentPage: number,
  currentSize: TablePageSize,
  currentSort: TableSort | null,
  pagination: { current?: unknown; pageSize?: unknown },
  sorter: unknown,
  allowed: readonly string[],
): { page: number; pageSize: TablePageSize; sort: TableSort | null } {
  const raw = readAntdSorter(sorter)
  const field = Array.isArray(raw.field) ? String(raw.field[0] ?? '') : String(raw.field ?? '')
  const sort = field ? normalizeTableSort(raw.field, raw.order, allowed) : currentSort
  const sortChanged = sort?.field !== currentSort?.field || sort?.order !== currentSort?.order
  const paging = nextTablePage(currentPage, currentSize, pagination.current, pagination.pageSize)
  return {
    page: sortChanged ? 1 : paging.page,
    pageSize: paging.pageSize,
    sort,
  }
}
