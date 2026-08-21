import { describe, expect, it } from 'vitest'

import { elementSortOrder, nextElementTableQuery, readElementSort } from '../element-sort'

describe('readElementSort', () => {
  it('maps Element order onto the shared TableSort order', () => {
    expect(readElementSort({ order: 'ascending', prop: 'name' })).toEqual({
      field: 'name',
      order: 'ascend',
    })
    expect(readElementSort({ order: 'descending', prop: 'createTime' })).toEqual({
      field: 'createTime',
      order: 'descend',
    })
    expect(readElementSort({ order: null, prop: 'name' })).toEqual({
      field: 'name',
      order: undefined,
    })
  })
})

describe('elementSortOrder', () => {
  it('writes the header state Element expects', () => {
    expect(elementSortOrder('ascend')).toBe('ascending')
    expect(elementSortOrder('descend')).toBe('descending')
  })
})

describe('nextElementTableQuery', () => {
  it('resets to page 1 when the sort field changes', () => {
    expect(
      nextElementTableQuery(
        3,
        10,
        { field: 'name', order: 'ascend' },
        { current: 3, pageSize: 10 },
        { order: 'descending', prop: 'createTime' },
        ['name', 'createTime', 'status'],
      ),
    ).toEqual({
      page: 1,
      pageSize: 10,
      sort: { field: 'createTime', order: 'descend' },
    })
  })
})
