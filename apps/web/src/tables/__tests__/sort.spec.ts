import { describe, expect, it } from 'vitest'

import {
  nextTableQuery,
  normalizeTableSort,
  readAntdSorter,
  sortByTableSort,
  TABLE_SORT_FIELDS,
} from '../sort'

describe('normalizeTableSort / readAntdSorter', () => {
  it('keeps allowed field+order and reads the first antd sorter', () => {
    expect(normalizeTableSort('name', 'ascend', TABLE_SORT_FIELDS.users)).toEqual({
      field: 'name',
      order: 'ascend',
    })
    expect(normalizeTableSort('remark', 'ascend', TABLE_SORT_FIELDS.users)).toBeNull()
    expect(normalizeTableSort('name', undefined, TABLE_SORT_FIELDS.users)).toBeNull()
    expect(readAntdSorter({ field: 'createTime', order: 'descend' })).toEqual({
      field: 'createTime',
      order: 'descend',
    })
    expect(readAntdSorter([{ columnKey: 'at', order: 'ascend' }])).toEqual({
      field: 'at',
      order: 'ascend',
    })
  })
})

describe('sortByTableSort / nextTableQuery', () => {
  it('sorts after the current list and resets page when the sort changes', () => {
    const rows = [
      { at: '2026-08-19 18:00:00', name: 'Ada' },
      { at: '2026-08-20 09:10:00', name: 'Bob' },
    ]
    expect(
      sortByTableSort(rows, { field: 'at', order: 'descend' }, (item, field) =>
        field === 'at' ? item.at : item.name,
      ).map((item) => item.name),
    ).toEqual(['Bob', 'Ada'])
    expect(
      nextTableQuery(3, 10, { field: 'name', order: 'ascend' }, { current: 3, pageSize: 10 }, { field: 'name', order: 'descend' }, TABLE_SORT_FIELDS.users),
    ).toEqual({ page: 1, pageSize: 10, sort: { field: 'name', order: 'descend' } })
    expect(
      nextTableQuery(3, 10, { field: 'name', order: 'ascend' }, { current: 2, pageSize: 10 }, { field: 'name', order: 'ascend' }, TABLE_SORT_FIELDS.users),
    ).toEqual({ page: 2, pageSize: 10, sort: { field: 'name', order: 'ascend' } })
    expect(
      nextTableQuery(3, 10, { field: 'name', order: 'ascend' }, { current: 2, pageSize: 10 }, {}, TABLE_SORT_FIELDS.users),
    ).toEqual({ page: 2, pageSize: 10, sort: { field: 'name', order: 'ascend' } })
    expect(
      nextTableQuery(3, 10, { field: 'name', order: 'ascend' }, { current: 3, pageSize: 10 }, { field: 'name' }, TABLE_SORT_FIELDS.users),
    ).toEqual({ page: 1, pageSize: 10, sort: null })
  })
})
