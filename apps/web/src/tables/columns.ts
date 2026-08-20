import { TABLE_PAGE_KEYS, type TablePageKey } from './page-size'

export type TableColumnSpec = {
  labels: Record<string, string>
  locked: string
  optional: readonly string[]
}

export const TABLE_COLUMN_SPECS: Record<TablePageKey, TableColumnSpec> = {
  audit: {
    labels: {
      action: '动作',
      actor: '操作者',
      at: '时间',
      summary: '摘要',
      target: '对象',
    },
    locked: 'at',
    optional: ['actor', 'target', 'action', 'summary'],
  },
  links: {
    labels: {
      code: '编码',
      createTime: '创建时间',
      iframeSrc: '地址',
      status: '状态',
      title: '名称',
    },
    locked: 'title',
    optional: ['code', 'iframeSrc', 'status', 'createTime'],
  },
  roles: {
    labels: {
      actionCodes: '操作权限',
      code: '编码',
      createTime: '创建时间',
      menuCodes: '菜单',
      name: '角色名称',
      remark: '备注',
      status: '状态',
      userCount: '人数',
    },
    locked: 'name',
    optional: ['code', 'menuCodes', 'actionCodes', 'userCount', 'status', 'remark', 'createTime'],
  },
  users: {
    labels: {
      createTime: '创建时间',
      deptId: '部门',
      name: '用户名',
      remark: '备注',
      roleIds: '业务角色',
      status: '状态',
    },
    locked: 'name',
    optional: ['deptId', 'roleIds', 'status', 'remark', 'createTime'],
  },
}

export type TableColumns = Record<TablePageKey, string[]>

export function tableColumnOrder(spec: TableColumnSpec): string[] {
  return [spec.locked, ...spec.optional]
}

export function emptyTableColumns(): TableColumns {
  return {
    audit: tableColumnOrder(TABLE_COLUMN_SPECS.audit),
    links: tableColumnOrder(TABLE_COLUMN_SPECS.links),
    roles: tableColumnOrder(TABLE_COLUMN_SPECS.roles),
    users: tableColumnOrder(TABLE_COLUMN_SPECS.users),
  }
}

export function isOptionalColumn(spec: TableColumnSpec, value: unknown): value is string {
  return typeof value === 'string' && spec.optional.some((key) => key === value)
}

export function normalizeColumns(input: unknown, spec: TableColumnSpec): string[] {
  const order = tableColumnOrder(spec)
  if (!Array.isArray(input)) return order
  const picked = new Set<string>([spec.locked])
  for (const item of input) {
    if (isOptionalColumn(spec, item)) picked.add(item)
  }
  return order.filter((key) => picked.has(key))
}

export function resolvePersistedColumns(columns: unknown, legacyUsers: unknown): TableColumns {
  const next = normalizeTableColumns(columns)
  const defaults = tableColumnOrder(TABLE_COLUMN_SPECS.users)
  const legacy = normalizeColumns(legacyUsers, TABLE_COLUMN_SPECS.users)
  if (next.users.join() === defaults.join() && legacy.join() !== defaults.join()) {
    next.users = legacy
  }
  return next
}

export function normalizeTableColumns(value: unknown): TableColumns {
  const current = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  const next = emptyTableColumns()
  for (const key of TABLE_PAGE_KEYS) {
    next[key] = normalizeColumns(current[key], TABLE_COLUMN_SPECS[key])
  }
  return next
}

export function toggleColumn(
  current: readonly string[],
  key: string,
  spec: TableColumnSpec,
): string[] {
  const visible = normalizeColumns(current, spec)
  if (!isOptionalColumn(spec, key)) return visible
  if (visible.includes(key)) {
    return normalizeColumns(
      visible.filter((item) => item !== key),
      spec,
    )
  }
  return normalizeColumns([...visible, key], spec)
}

export function isColumnVisible(
  current: readonly string[],
  key: string,
  spec: TableColumnSpec,
): boolean {
  if (key === 'actions' || key === spec.locked) return true
  return normalizeColumns(current, spec).includes(key)
}

export function tableColumnKey(column: { dataIndex?: unknown; key?: unknown }): string {
  if (typeof column.dataIndex === 'string') return column.dataIndex
  if (typeof column.key === 'string') return column.key
  return ''
}
