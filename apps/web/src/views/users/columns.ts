export const USER_LOCKED_COLUMN = 'name'

export const USER_OPTIONAL_COLUMNS = [
  'deptId',
  'roleIds',
  'status',
  'remark',
  'createTime',
] as const

export type UserOptionalColumn = (typeof USER_OPTIONAL_COLUMNS)[number]

export const USER_COLUMN_ORDER = [USER_LOCKED_COLUMN, ...USER_OPTIONAL_COLUMNS] as const

export const USER_COLUMN_LABELS: Record<(typeof USER_COLUMN_ORDER)[number], string> = {
  createTime: '创建时间',
  deptId: '部门',
  name: '用户名',
  remark: '备注',
  roleIds: '业务角色',
  status: '状态',
}

export function isUserOptionalColumn(value: unknown): value is UserOptionalColumn {
  return USER_OPTIONAL_COLUMNS.some((key) => key === value)
}

export function normalizeUserColumns(input: unknown): string[] {
  if (!Array.isArray(input)) return [...USER_COLUMN_ORDER]
  const picked = new Set<string>([USER_LOCKED_COLUMN])
  for (const item of input) {
    if (isUserOptionalColumn(item)) picked.add(item)
  }
  return USER_COLUMN_ORDER.filter((key) => picked.has(key))
}

export function toggleUserColumn(current: readonly string[], key: string): string[] {
  const visible = normalizeUserColumns(current)
  if (!isUserOptionalColumn(key)) return visible
  if (visible.includes(key)) {
    return normalizeUserColumns(visible.filter((item) => item !== key))
  }
  return normalizeUserColumns([...visible, key])
}

export function isUserColumnVisible(current: readonly string[], key: string): boolean {
  if (key === 'actions' || key === USER_LOCKED_COLUMN) return true
  return normalizeUserColumns(current).includes(key)
}

export function userColumnKey(column: { dataIndex?: unknown; key?: unknown }): string {
  if (typeof column.dataIndex === 'string') return column.dataIndex
  if (typeof column.key === 'string') return column.key
  return ''
}
