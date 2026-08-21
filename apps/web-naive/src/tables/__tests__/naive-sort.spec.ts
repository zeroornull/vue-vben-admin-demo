import { describe, expect, it } from 'vitest'

import { nextNaiveTableQuery, readNaiveSort } from '../naive-sort'

describe('readNaiveSort', () => {
  it('keeps Naive ascend/descend and clears false', () => {
    expect(readNaiveSort({ columnKey: 'name', order: 'ascend' })).toEqual({
      field: 'name',
      order: 'ascend',
    })
    expect(readNaiveSort({ columnKey: 'createTime', order: 'descend' })).toEqual({
      field: 'createTime',
      order: 'descend',
    })
    expect(readNaiveSort({ columnKey: 'name', order: false })).toEqual({
      field: 'name',
      order: undefined,
    })
  })
})

describe('nextNaiveTableQuery', () => {
  it('resets to page 1 when the sort field changes', () => {
    expect(
      nextNaiveTableQuery(
        3,
        10,
        { field: 'name', order: 'ascend' },
        { current: 3, pageSize: 10 },
        { columnKey: 'createTime', order: 'descend' },
        ['name', 'createTime', 'status'],
      ),
    ).toEqual({
      page: 1,
      pageSize: 10,
      sort: { field: 'createTime', order: 'descend' },
    })
  })
})
