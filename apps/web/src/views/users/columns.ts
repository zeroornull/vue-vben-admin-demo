import {
  TABLE_COLUMN_SPECS,
  isColumnVisible,
  normalizeColumns,
  tableColumnKey,
  tableColumnOrder,
  toggleColumn,
} from '../../tables/columns'

const spec = TABLE_COLUMN_SPECS.users

export const USER_LOCKED_COLUMN = spec.locked

export const USER_OPTIONAL_COLUMNS = spec.optional

export type UserOptionalColumn = (typeof USER_OPTIONAL_COLUMNS)[number]

export const USER_COLUMN_ORDER = tableColumnOrder(spec)

export const USER_COLUMN_LABELS = spec.labels

export function isUserOptionalColumn(value: unknown): value is UserOptionalColumn {
  return USER_OPTIONAL_COLUMNS.some((key) => key === value)
}

export function normalizeUserColumns(input: unknown): string[] {
  return normalizeColumns(input, spec)
}

export function toggleUserColumn(current: readonly string[], key: string): string[] {
  return toggleColumn(current, key, spec)
}

export function isUserColumnVisible(current: readonly string[], key: string): boolean {
  return isColumnVisible(current, key, spec)
}

export function userColumnKey(column: { dataIndex?: unknown; key?: unknown }): string {
  return tableColumnKey(column)
}
