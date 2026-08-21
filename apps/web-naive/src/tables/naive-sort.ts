import { nextTablePage, type TablePageSize } from '@app/tables/page-size'
import { nextTableQuery, type TableSort } from '@app/tables/sort'

export function readNaiveSort(payload: { columnKey?: unknown; order?: unknown }): {
  field: unknown
  order: unknown
} {
  if (payload.order === 'ascend' || payload.order === 'descend') {
    return { field: payload.columnKey, order: payload.order }
  }
  return { field: payload.columnKey, order: undefined }
}

export function nextNaiveTableQuery(
  currentPage: number,
  currentSize: TablePageSize,
  currentSort: TableSort | null,
  pagination: { current?: unknown; pageSize?: unknown },
  sorter: { columnKey?: unknown; order?: unknown },
  allowed: readonly string[],
) {
  return nextTableQuery(
    currentPage,
    currentSize,
    currentSort,
    pagination,
    readNaiveSort(sorter),
    allowed,
  )
}

export function nextNaivePage(
  currentPage: number,
  currentSize: TablePageSize,
  incomingPage: unknown,
  incomingSize: unknown,
) {
  return nextTablePage(currentPage, currentSize, incomingPage, incomingSize)
}
