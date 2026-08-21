import { nextTablePage, type TablePageSize } from '@app/tables/page-size'
import { nextTableQuery, type TableSort } from '@app/tables/sort'

export function readAntdvSort(payload: { columnKey?: unknown; field?: unknown; order?: unknown }): {
  field: unknown
  order: unknown
} {
  if (payload.order === 'ascend' || payload.order === 'descend') {
    return { field: payload.field ?? payload.columnKey, order: payload.order }
  }
  return { field: payload.field ?? payload.columnKey, order: undefined }
}

export function nextAntdvTableQuery(
  currentPage: number,
  currentSize: TablePageSize,
  currentSort: TableSort | null,
  pagination: { current?: unknown; pageSize?: unknown },
  sorter: { columnKey?: unknown; field?: unknown; order?: unknown },
  allowed: readonly string[],
) {
  return nextTableQuery(
    currentPage,
    currentSize,
    currentSort,
    pagination,
    readAntdvSort(sorter),
    allowed,
  )
}

export function nextAntdvPage(
  currentPage: number,
  currentSize: TablePageSize,
  incomingPage: unknown,
  incomingSize: unknown,
) {
  return nextTablePage(currentPage, currentSize, incomingPage, incomingSize)
}
