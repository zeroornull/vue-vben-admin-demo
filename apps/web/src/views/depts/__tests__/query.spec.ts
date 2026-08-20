import { describe, expect, it } from 'vitest'

import {
  buildDeptTree,
  canAssignParent,
  collectDescendantIds,
  deptDeleteBlocker,
  deptNameById,
  disabledParentIds,
  filterDeptTree,
  flattenDepts,
  isDeptNameTaken,
  parseDeptQuery,
  toParentOptions,
  validateDeptForm,
} from '../query'
import type { SystemDept } from '../types'

const flat: SystemDept[] = [
  { createTime: '2024-01-01 00:00:00', id: 'a', name: '集团', parentId: null, remark: '', status: 1 },
  { createTime: '2024-01-02 00:00:00', id: 'b', name: '研发', parentId: 'a', remark: '', status: 1 },
  { createTime: '2024-01-03 00:00:00', id: 'c', name: '前端', parentId: 'b', remark: '', status: 0 },
  { createTime: '2024-01-04 00:00:00', id: 'd', name: '支持', parentId: null, remark: '', status: 1 },
]

describe('parseDeptQuery', () => {
  it('reads name and status', () => {
    expect(parseDeptQuery(new URLSearchParams('name=%20研发%20&status=1'))).toEqual({
      name: '研发',
      status: 1,
    })
  })
})

describe('buildDeptTree / flattenDepts', () => {
  it('nests by parentId and flattens back', () => {
    const tree = buildDeptTree(flat)
    expect(tree.map((node) => node.id)).toEqual(['a', 'd'])
    expect(tree[0]?.children?.[0]?.children?.[0]?.name).toBe('前端')
    expect(flattenDepts(tree).map((item) => item.id)).toEqual(['a', 'b', 'c', 'd'])
  })
})

describe('tree constraints', () => {
  it('collects descendants', () => {
    expect(collectDescendantIds(flat, 'a')).toEqual(['b', 'c'])
  })

  it('rejects self or descendant as parent', () => {
    expect(canAssignParent(flat, 'a', 'c')).toBe(false)
    expect(canAssignParent(flat, 'a', 'a')).toBe(false)
    expect(canAssignParent(flat, 'c', 'd')).toBe(true)
    expect(canAssignParent(flat, 'c', 'missing')).toBe(false)
  })

  it('treats names as unique among siblings', () => {
    expect(isDeptNameTaken(flat, '研发', 'a')).toBe(true)
    expect(isDeptNameTaken(flat, '研发', 'a', 'b')).toBe(false)
    expect(isDeptNameTaken(flat, '研发', null)).toBe(false)
  })
})

describe('filterDeptTree', () => {
  it('keeps ancestors of a name match', () => {
    const filtered = filterDeptTree(buildDeptTree(flat), { name: '前端', status: '' })
    expect(flattenDepts(filtered).map((item) => item.id)).toEqual(['a', 'b', 'c'])
  })

  it('filters by status but keeps ancestor path', () => {
    const filtered = filterDeptTree(buildDeptTree(flat), { name: '', status: 0 })
    expect(flattenDepts(filtered).map((item) => item.id)).toEqual(['a', 'b', 'c'])
  })
})

describe('toParentOptions', () => {
  it('disables self and descendants', () => {
    const options = toParentOptions(buildDeptTree(flat), disabledParentIds(flat, 'a'))
    expect(options[0]).toMatchObject({ disabled: true, value: 'a' })
    expect(options[0]?.children?.[0]).toMatchObject({ disabled: true, value: 'b' })
    expect(options[1]).toMatchObject({ disabled: false, value: 'd' })
  })
})

describe('deptDeleteBlocker / deptNameById', () => {
  it('blocks children first, then assigned users', () => {
    expect(deptDeleteBlocker(true, 3)).toBe('请先删除下级部门')
    expect(deptDeleteBlocker(false, 2)).toBe('请先移走该部门下的用户')
    expect(deptDeleteBlocker(false, 0)).toBeNull()
  })

  it('maps id to name', () => {
    expect(deptNameById(flat).get('b')).toBe('研发')
  })
})

describe('validateDeptForm', () => {
  it('requires a name and normalizes parentId', () => {
    expect(validateDeptForm({ name: '  ', parentId: null, remark: '', status: 1 })).toEqual({
      message: '请输入部门名称',
      ok: false,
    })
    expect(
      validateDeptForm({ name: '  设计  ', parentId: null, remark: '  x  ', status: 0 }),
    ).toEqual({
      ok: true,
      value: { name: '设计', parentId: null, remark: 'x', status: 0 },
    })
  })
})
