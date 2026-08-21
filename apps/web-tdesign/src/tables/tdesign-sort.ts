import { nextTablePage, type TablePageSize } from '@app/tables/page-size'
import { nextTableQuery, type TableSort } from '@app/tables/sort'

export type TdesignSort = {
  descending: boolean
  sortBy: string
}

export function toTdesignSort(sort: TableSort | null): TdesignSort | undefined {
  if (!sort) return undefined
  return { descending: sort.order === 'descend', sortBy: sort.field }
}

export function readTdesignSort(
  payload: Partial<TdesignSort> | Array<Partial<TdesignSort>> | undefined | null,
): {
  field: unknown
  order: unknown
} {
  const first = Array.isArray(payload) ? payload[0] : payload
  if (!first?.sortBy) return { field: undefined, order: undefined }
  return {
    field: first.sortBy,
    order: first.descending ? 'descend' : 'ascend',
  }
}

export function nextTdesignTableQuery(
  currentPage: number,
  currentSize: TablePageSize,
  currentSort: TableSort | null,
  pagination: { current?: unknown; pageSize?: unknown },
  sorter: Partial<TdesignSort> | Array<Partial<TdesignSort>> | undefined | null,
  allowed: readonly string[],
) {
  return nextTableQuery(
    currentPage,
    currentSize,
    currentSort,
    pagination,
    readTdesignSort(sorter),
    allowed,
  )
}

export function nextTdesignPage(
  currentPage: number,
  currentSize: TablePageSize,
  incomingPage: unknown,
  incomingSize: unknown,
) {
  return nextTablePage(currentPage, currentSize, incomingPage, incomingSize)
}
