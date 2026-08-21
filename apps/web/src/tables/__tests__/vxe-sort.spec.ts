import { describe, expect, it } from 'vitest'

import { nextVxeTableQuery, readVxeSort, vxeSortOrder } from '../vxe-sort'

describe('readVxeSort', () => {
  it('maps vxe order onto the shared TableSort order', () => {
    expect(readVxeSort({ field: 'name', order: 'asc' })).toEqual({
      field: 'name',
      order: 'ascend',
    })
    expect(readVxeSort({ field: 'createTime', order: 'desc' })).toEqual({
      field: 'createTime',
      order: 'descend',
    })
    expect(readVxeSort({ field: 'name', order: null })).toEqual({
      field: 'name',
      order: undefined,
    })
    expect(readVxeSort({ field: 'name', order: '' })).toEqual({
      field: 'name',
      order: undefined,
    })
  })
})

describe('vxeSortOrder', () => {
  it('writes the header state vxe expects', () => {
    expect(vxeSortOrder('ascend')).toBe('asc')
    expect(vxeSortOrder('descend')).toBe('desc')
  })
})

describe('nextVxeTableQuery', () => {
  it('resets to page 1 when the sort field changes', () => {
    expect(
      nextVxeTableQuery(
        3,
        10,
        { field: 'name', order: 'ascend' },
        { current: 3, pageSize: 10 },
        { field: 'createTime', order: 'desc' },
        ['name', 'createTime', 'status'],
      ),
    ).toEqual({
      page: 1,
      pageSize: 10,
      sort: { field: 'createTime', order: 'descend' },
    })
  })
})
