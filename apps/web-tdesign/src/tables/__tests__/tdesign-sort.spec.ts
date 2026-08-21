import { describe, expect, it } from 'vitest'

import { nextTdesignTableQuery, readTdesignSort, toTdesignSort } from '../tdesign-sort'

describe('toTdesignSort', () => {
  it('maps shared ascend/descend to TDesign sortBy/descending', () => {
    expect(toTdesignSort({ field: 'name', order: 'ascend' })).toEqual({
      descending: false,
      sortBy: 'name',
    })
    expect(toTdesignSort({ field: 'createTime', order: 'descend' })).toEqual({
      descending: true,
      sortBy: 'createTime',
    })
    expect(toTdesignSort(null)).toBeUndefined()
  })
})

describe('readTdesignSort', () => {
  it('maps TDesign sort back to shared ascend/descend', () => {
    expect(readTdesignSort({ sortBy: 'name', descending: false })).toEqual({
      field: 'name',
      order: 'ascend',
    })
    expect(readTdesignSort({ sortBy: 'createTime', descending: true })).toEqual({
      field: 'createTime',
      order: 'descend',
    })
    expect(readTdesignSort(undefined)).toEqual({ field: undefined, order: undefined })
  })
})

describe('nextTdesignTableQuery', () => {
  it('resets to page 1 when the sort field changes', () => {
    expect(
      nextTdesignTableQuery(
        3,
        10,
        { field: 'name', order: 'ascend' },
        { current: 3, pageSize: 10 },
        { sortBy: 'createTime', descending: true },
        ['name', 'createTime', 'status'],
      ),
    ).toEqual({
      page: 1,
      pageSize: 10,
      sort: { field: 'createTime', order: 'descend' },
    })
  })
})
