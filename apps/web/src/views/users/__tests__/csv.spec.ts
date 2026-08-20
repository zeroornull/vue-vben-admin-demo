import { describe, expect, it } from 'vitest'

import {
  csvEscape,
  csvFileName,
  importCsvSummary,
  invertNameMap,
  parseCsv,
  parseUserCsv,
  stripBom,
  stripFormulaPrefix,
  userCsvRow,
  usersToCsv,
} from '../csv'
import type { SystemUser } from '../types'

const alice: SystemUser = {
  createTime: '2024-01-02 09:00:00',
  deptId: 'd-2',
  id: 'u-1',
  name: 'Alice',
  remark: '产品, 主力',
  roleIds: ['r-1'],
  status: 1,
}

describe('csvEscape', () => {
  it('quotes commas and doubles inner quotes', () => {
    expect(csvEscape('产品, 主力')).toBe('"产品, 主力"')
    expect(csvEscape('say "hi"')).toBe('"say ""hi"""')
  })

  it('neutralizes formula-looking cells', () => {
    expect(csvEscape('=1+1')).toBe("'=1+1")
    expect(csvEscape('+cmd')).toBe("'+cmd")
  })
})

describe('usersToCsv / csvFileName', () => {
  it('adds a BOM and joins labeled rows', () => {
    const csv = usersToCsv([userCsvRow(alice, '设计部', '管理员')])
    expect(csv.startsWith('\uFEFF')).toBe(true)
    expect(csv).toContain('用户名,部门,业务角色,状态,备注,创建时间')
    expect(csv).toContain('Alice,设计部,管理员,启用,"产品, 主力",2024-01-02 09:00:00')
  })

  it('names the file with the local date', () => {
    expect(csvFileName('users', new Date(2026, 7, 20))).toBe('users-20260820.csv')
  })
})

const lookup = {
  deptIdByName: new Map([
    ['设计部', 'd-2'],
    ['研发部', 'd-1'],
  ]),
  roleIdByName: new Map([
    ['管理员', 'r-1'],
    ['编辑', 'r-2'],
  ]),
}

describe('parseCsv / strip helpers', () => {
  it('strips BOM and quoted commas', () => {
    expect(stripBom('\uFEFFa,b')).toBe('a,b')
    expect(parseCsv('\uFEFFa,"b,c"\r\n')).toEqual([['a', 'b,c']])
  })

  it('strips the export formula prefix only', () => {
    expect(stripFormulaPrefix("'=1+1")).toBe('=1+1')
    expect(stripFormulaPrefix("don't")).toBe("don't")
  })

  it('inverts id → name maps', () => {
    expect(invertNameMap(new Map([['d-2', '设计部']]))).toEqual(new Map([['设计部', 'd-2']]))
  })
})

describe('parseUserCsv', () => {
  it('round-trips an exported row', () => {
    const csv = usersToCsv([userCsvRow(alice, '设计部', '管理员')])
    const result = parseUserCsv(csv, lookup)
    expect(result.rejected).toEqual([])
    expect(result.accepted).toEqual([
      {
        line: 2,
        value: {
          deptId: 'd-2',
          name: 'Alice',
          remark: '产品, 主力',
          roleIds: ['r-1'],
          status: 1,
        },
      },
    ])
  })

  it('maps 未分配 and split roles, ignores createTime', () => {
    const csv = usersToCsv([
      userCsvRow(
        { ...alice, deptId: null, roleIds: ['r-1', 'r-2'], status: 0 },
        '未分配',
        '管理员、编辑',
      ),
    ])
    const [row] = parseUserCsv(csv, lookup).accepted
    expect(row?.value.deptId).toBeNull()
    expect(row?.value.roleIds).toEqual(['r-1', 'r-2'])
    expect(row?.value.status).toBe(0)
  })

  it('reads back a formula-escaped name', () => {
    const csv = usersToCsv([userCsvRow({ ...alice, name: '=1+1' }, '未分配', '未分配')])
    expect(parseUserCsv(csv, lookup).accepted[0]?.value.name).toBe('=1+1')
  })

  it('rejects unknown labels and bad headers', () => {
    expect(parseUserCsv('', lookup).rejected[0]?.message).toBe('文件是空的')
    expect(parseUserCsv('a,b\n1,2', lookup).rejected[0]?.message).toBe('表头必须是导出时的那一行')
    expect(
      parseUserCsv('用户名,部门,业务角色,状态,备注,创建时间\n', lookup).rejected[0]?.message,
    ).toBe('没有数据行')
    const csv = usersToCsv([userCsvRow(alice, '幽灵部', '幽灵角色')])
    expect(parseUserCsv(csv, lookup).rejected[0]?.message).toBe('没有部门「幽灵部」')
  })

  it('rejects unknown roles after a known dept', () => {
    const csv = usersToCsv([userCsvRow(alice, '设计部', '幽灵角色')])
    expect(parseUserCsv(csv, lookup).rejected[0]?.message).toBe('没有角色「幽灵角色」')
  })

  it('caps extra rows at the export limit', () => {
    const header = '用户名,部门,业务角色,状态,备注,创建时间'
    const lines = Array.from({ length: 101 }, (_, index) => `u${index},未分配,未分配,启用,,`)
    const result = parseUserCsv([header, ...lines].join('\n'), lookup)
    expect(result.accepted).toHaveLength(100)
    expect(result.rejected[0]).toEqual({
      line: 102,
      message: '最多导入 100 条，多出的已忽略',
    })
  })
})

describe('importCsvSummary', () => {
  it('lists the first three failures', () => {
    expect(importCsvSummary(2, [])).toBe('导入成功 2 条')
    expect(
      importCsvSummary(1, [
        { line: 2, message: '用户名已存在' },
        { line: 3, message: '没有部门「幽灵部」' },
        { line: 4, message: '状态只能是启用或禁用' },
        { line: 5, message: '请输入用户名' },
      ]),
    ).toBe(
      '导入成功 1 条，跳过 4 条。第 2 行：用户名已存在；第 3 行：没有部门「幽灵部」；第 4 行：状态只能是启用或禁用',
    )
  })
})
