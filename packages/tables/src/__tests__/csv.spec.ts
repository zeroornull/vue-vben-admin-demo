import { describe, expect, it } from 'vitest'

import {
  csvEscape,
  csvFileName,
  importCsvSummary,
  parseCsv,
  parseStatusLabel,
  readCsvBody,
  rowsToCsv,
  stripBom,
  stripFormulaPrefix,
} from '../csv.ts'

describe('rowsToCsv', () => {
  it('adds a BOM and escapes formulas', () => {
    const csv = rowsToCsv(['名称', '备注'], [['Ada', '=1+1']])
    expect(csv.startsWith('\uFEFF')).toBe(true)
    expect(csv).toContain("Ada,'=1+1")
    expect(csvEscape('a,b')).toBe('"a,b"')
    expect(csvFileName('roles', new Date(2026, 7, 20))).toBe('roles-20260820.csv')
    expect(stripBom('\uFEFFa,b')).toBe('a,b')
    expect(parseCsv('\uFEFFa,"b,c"\r\n')).toEqual([['a', 'b,c']])
    expect(stripFormulaPrefix("'=1+1")).toBe('=1+1')
    expect(parseStatusLabel('启用')).toBe(1)
    expect(importCsvSummary(2, [])).toBe('导入成功 2 条')
    expect(readCsvBody('a,b\n1,2', ['a', 'b'], 10).body).toEqual([['1', '2']])
    expect(readCsvBody('', ['a'], 10).rejected[0]?.message).toBe('文件是空的')
  })
})
