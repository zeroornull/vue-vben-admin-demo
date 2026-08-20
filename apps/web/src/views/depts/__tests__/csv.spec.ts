import { describe, expect, it } from 'vitest'

import { buildDeptTree, filterDeptTree } from '../query'
import type { SystemDept } from '../types'
import {
  applyDeptDrafts,
  deptLookupFromCatalog,
  deptPath,
  deptsForCsv,
  deptsToCsv,
  orderDeptDraftsForImport,
  parseDeptCsv,
  resolveDeptDraft,
} from '../csv'

const flat: SystemDept[] = [
  { createTime: '2024-01-01 00:00:00', id: 'a', name: '集团', parentId: null, remark: '', status: 1, userCount: 1 },
  { createTime: '2024-01-02 00:00:00', id: 'b', name: '研发', parentId: 'a', remark: '', status: 1, userCount: 0 },
  { createTime: '2024-01-03 00:00:00', id: 'c', name: '前端', parentId: 'b', remark: '产品, 组', status: 0, userCount: 2 },
]

describe('deptPath / deptsForCsv', () => {
  it('writes the ancestor path and only the filtered tree', () => {
    const names = new Map(flat.map((item) => [item.id, item.name]))
    const parents = new Map(flat.map((item) => [item.id, item.parentId]))
    expect(deptPath('c', names, parents)).toBe('集团 / 研发 / 前端')
    const tree = filterDeptTree(buildDeptTree(flat), { name: '前端', status: '' })
    const result = deptsForCsv(tree, buildDeptTree(flat))
    expect(result.total).toBe(3)
    expect(result.rows.map((row) => row.name)).toEqual(['集团', '研发', '前端'])
    expect(result.rows[2]).toMatchObject({
      parent: '研发',
      path: '集团 / 研发 / 前端',
      status: '禁用',
      userCount: '2',
    })
    const csv = deptsToCsv(result.rows)
    expect(csv.startsWith('\uFEFF')).toBe(true)
    expect(csv).toContain('部门名称,上级,路径,人数,状态,备注,创建时间')
    expect(csv).toContain('"产品, 组"')
  })
})

describe('parseDeptCsv / resolveDeptDraft', () => {
  it('round-trips an exported tree and skips existing siblings', () => {
    const tree = buildDeptTree(flat)
    const csv = deptsToCsv(deptsForCsv(tree, tree).rows)
    const parsed = parseDeptCsv(csv)
    expect(parsed.rejected).toEqual([])
    expect(parsed.drafts.map((row) => row.name)).toEqual(['集团', '研发', '前端'])
    const applied = applyDeptDrafts(parsed.drafts, deptLookupFromCatalog(tree))
    expect(applied.accepted).toEqual([])
    expect(applied.rejected.map((item) => item.message)).toEqual([
      '同级部门名称已存在',
      '同级部门名称已存在',
      '同级部门名称已存在',
    ])
  })

  it('creates a child under a unique parent, and a same-file subtree', () => {
    const lookup = deptLookupFromCatalog(buildDeptTree(flat))
    const csv = [
      '部门名称,上级,路径,人数,状态,备注,创建时间',
      '新组,研发,,0,启用,,',
      '新事业部,无,,0,禁用,,',
      '新前端,新事业部,新事业部 / 新前端,0,启用,"产品, 组",',
    ].join('\n')
    const parsed = parseDeptCsv(csv)
    expect(parsed.rejected).toEqual([])
    expect(orderDeptDraftsForImport(parsed.drafts).map((row) => row.name)).toEqual([
      '新事业部',
      '新组',
      '新前端',
    ])
    const applied = applyDeptDrafts(parsed.drafts, lookup)
    expect(applied.rejected).toEqual([])
    expect(applied.accepted.map((row) => row.value)).toEqual([
      { name: '新事业部', parentId: null, remark: '', status: 0 },
      { name: '新组', parentId: 'b', remark: '', status: 1 },
      { name: '新前端', parentId: 'import-3', remark: '产品, 组', status: 1 },
    ])
  })

  it('uses path when the parent name is not unique', () => {
    const withTwin: SystemDept[] = [
      ...flat,
      { createTime: '2024-01-04 00:00:00', id: 'd', name: '支持', parentId: null, remark: '', status: 1 },
      { createTime: '2024-01-05 00:00:00', id: 'e', name: '研发', parentId: 'd', remark: '', status: 1 },
    ]
    const lookup = deptLookupFromCatalog(buildDeptTree(withTwin))
    const ambiguous = parseDeptCsv(
      '部门名称,上级,路径,人数,状态,备注,创建时间\n新组,研发,,0,启用,,\n',
    )
    expect(resolveDeptDraft(ambiguous.drafts[0]!, lookup).ok).toBe(false)
    const viaPath = parseDeptCsv(
      '部门名称,上级,路径,人数,状态,备注,创建时间\n新组,研发,支持 / 研发 / 新组,0,启用,,\n',
    )
    expect(resolveDeptDraft(viaPath.drafts[0]!, lookup)).toEqual({
      ok: true,
      value: { name: '新组', parentId: 'e', remark: '', status: 1 },
    })
  })

  it('rejects missing parent, bad path, and bad headers', () => {
    expect(parseDeptCsv('').rejected[0]?.message).toBe('文件是空的')
    expect(parseDeptCsv('a,b\n1,2').rejected[0]?.message).toBe('表头必须是导出时的那一行')
    const missing = parseDeptCsv(
      '部门名称,上级,路径,人数,状态,备注,创建时间\n新组,幽灵,,0,启用,,\n',
    )
    expect(resolveDeptDraft(missing.drafts[0]!, deptLookupFromCatalog(buildDeptTree(flat)))).toEqual({
      ok: false,
      message: '没有上级部门「幽灵」',
    })
    const mismatch = parseDeptCsv(
      '部门名称,上级,路径,人数,状态,备注,创建时间\n新组,研发,集团 / 前端 / 新组,0,启用,,\n',
    )
    expect(resolveDeptDraft(mismatch.drafts[0]!, deptLookupFromCatalog(buildDeptTree(flat)))).toEqual({
      ok: false,
      message: '路径上级与「研发」不一致',
    })
  })
})
