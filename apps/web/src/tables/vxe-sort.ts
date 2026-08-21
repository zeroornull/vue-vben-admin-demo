import { nextTablePage, type TablePageSize } from '@app/tables/page-size'
import {
  nextTableQuery,
  type TableSort,
  type TableSortOrder,
} from '@app/tables/sort'

export function vxeSortOrder(order: TableSortOrder): 'asc' | 'desc' {
  return order === 'ascend' ? 'asc' : 'desc'
}

export function readVxeSort(payload: { field?: unknown; order?: unknown }): {
  field: unknown
  order: unknown
} {
  if (payload.order === 'asc') return { field: payload.field, order: 'ascend' }
  if (payload.order === 'desc') return { field: payload.field, order: 'descend' }
  return { field: payload.field, order: undefined }
}

export function nextVxeTableQuery(
  currentPage: number,
  currentSize: TablePageSize,
  currentSort: TableSort | null,
  pagination: { current?: unknown; pageSize?: unknown },
  sorter: { field?: unknown; order?: unknown },
  allowed: readonly string[],
) {
  return nextTableQuery(
    currentPage,
    currentSize,
    currentSort,
    pagination,
    readVxeSort(sorter),
    allowed,
  )
}

export function nextVxePage(
  currentPage: number,
  currentSize: TablePageSize,
  incomingPage: unknown,
  incomingSize: unknown,
) {
  return nextTablePage(currentPage, currentSize, incomingPage, incomingSize)
}
