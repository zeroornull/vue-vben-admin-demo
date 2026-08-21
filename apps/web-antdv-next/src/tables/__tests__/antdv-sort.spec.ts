import { describe, expect, it } from 'vitest'

import { nextAntdvTableQuery, readAntdvSort } from '../antdv-sort'

describe('readAntdvSort', () => {
  it('keeps antdv-next ascend/descend and clears false', () => {
    expect(readAntdvSort({ field: 'name', order: 'ascend' })).toEqual({
      field: 'name',
      order: 'ascend',
    })
    expect(readAntdvSort({ columnKey: 'createTime', order: 'descend' })).toEqual({
      field: 'createTime',
      order: 'descend',
    })
    expect(readAntdvSort({ field: 'name', order: false })).toEqual({
      field: 'name',
      order: undefined,
    })
  })
})

describe('nextAntdvTableQuery', () => {
  it('resets to page 1 when the sort field changes', () => {
    expect(
      nextAntdvTableQuery(
        3,
        10,
        { field: 'name', order: 'ascend' },
        { current: 3, pageSize: 10 },
        { field: 'createTime', order: 'descend' },
        ['name', 'createTime', 'status'],
      ),
    ).toEqual({
      page: 1,
      pageSize: 10,
      sort: { field: 'createTime', order: 'descend' },
    })
  })
})
