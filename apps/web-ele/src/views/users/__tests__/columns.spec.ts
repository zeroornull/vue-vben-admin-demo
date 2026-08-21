import { describe, expect, it } from 'vitest'

import {
  USER_COLUMN_ORDER,
  isUserColumnVisible,
  normalizeUserColumns,
  toggleUserColumn,
  userColumnKey,
} from '../columns'

describe('normalizeUserColumns', () => {
  it('defaults to every column and always keeps 用户名', () => {
    expect(normalizeUserColumns(undefined)).toEqual([...USER_COLUMN_ORDER])
    expect(normalizeUserColumns(['remark', 'nope'])).toEqual(['name', 'remark'])
    expect(normalizeUserColumns([])).toEqual(['name'])
  })
})

describe('toggleUserColumn', () => {
  it('hides optional columns and ignores 用户名', () => {
    const hidden = toggleUserColumn([...USER_COLUMN_ORDER], 'remark')
    expect(hidden).not.toContain('remark')
    expect(toggleUserColumn(hidden, 'remark')).toContain('remark')
    expect(toggleUserColumn(hidden, 'name')).toEqual(hidden)
  })
})

describe('isUserColumnVisible / userColumnKey', () => {
  it('keeps locked and action columns on', () => {
    expect(isUserColumnVisible(['name'], 'name')).toBe(true)
    expect(isUserColumnVisible(['name'], 'actions')).toBe(true)
    expect(isUserColumnVisible(['name'], 'deptId')).toBe(false)
    expect(userColumnKey({ dataIndex: 'status' })).toBe('status')
    expect(userColumnKey({ key: 'actions' })).toBe('actions')
  })
})
