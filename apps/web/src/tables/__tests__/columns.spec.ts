import { describe, expect, it } from 'vitest'

import {
  TABLE_COLUMN_SPECS,
  emptyTableColumns,
  isColumnVisible,
  normalizeColumns,
  normalizeTableColumns,
  resolvePersistedColumns,
  tableColumnKey,
  toggleColumn,
} from '../columns'

describe('normalizeColumns / toggleColumn', () => {
  it('keeps the locked column and drops unknown keys', () => {
    const spec = TABLE_COLUMN_SPECS.roles
    expect(normalizeColumns(['remark', 'nope'], spec)).toEqual(['name', 'remark'])
    expect(normalizeColumns([], spec)).toEqual(['name'])
    const hidden = toggleColumn(emptyTableColumns().roles, 'code', spec)
    expect(hidden).not.toContain('code')
    expect(toggleColumn(hidden, 'name', spec)).toEqual(hidden)
    expect(isColumnVisible(['name'], 'actions', spec)).toBe(true)
    expect(isColumnVisible(['name'], 'code', spec)).toBe(false)
    expect(tableColumnKey({ dataIndex: 'code' })).toBe('code')
  })
})

describe('normalizeTableColumns', () => {
  it('fills missing tables and keeps a valid users list', () => {
    const next = normalizeTableColumns({ users: ['name', 'remark'] })
    expect(next.users).toEqual(['name', 'remark'])
    expect(next.audit[0]).toBe('at')
    expect(next.links[0]).toBe('title')
    expect(resolvePersistedColumns({}, ['name', 'remark']).users).toEqual(['name', 'remark'])
  })
})
