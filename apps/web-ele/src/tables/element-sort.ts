import { nextTablePage, type TablePageSize } from '@app/tables/page-size'
import {
  nextTableQuery,
  type TableSort,
  type TableSortOrder,
} from '@app/tables/sort'

export function elementSortOrder(order: TableSortOrder): 'ascending' | 'descending' {
  return order === 'ascend' ? 'ascending' : 'descending'
}

export function readElementSort(payload: { order?: unknown; prop?: unknown }): {
  field: unknown
  order: unknown
} {
  if (payload.order === 'ascending') return { field: payload.prop, order: 'ascend' }
  if (payload.order === 'descending') return { field: payload.prop, order: 'descend' }
  return { field: payload.prop, order: undefined }
}

export function nextElementTableQuery(
  currentPage: number,
  currentSize: TablePageSize,
  currentSort: TableSort | null,
  pagination: { current?: unknown; pageSize?: unknown },
  sorter: { order?: unknown; prop?: unknown },
  allowed: readonly string[],
) {
  return nextTableQuery(
    currentPage,
    currentSize,
    currentSort,
    pagination,
    readElementSort(sorter),
    allowed,
  )
}

export function nextElementPage(
  currentPage: number,
  currentSize: TablePageSize,
  incomingPage: unknown,
  incomingSize: unknown,
) {
  return nextTablePage(currentPage, currentSize, incomingPage, incomingSize)
}
