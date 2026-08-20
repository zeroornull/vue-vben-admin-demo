import { describe, expect, it } from 'vitest'

import { auditCsvRow, auditToCsv, parseAuditCsv } from '../csv'
import type { AuditEntry } from '../query'

const row: AuditEntry = {
  action: 'delete',
  actor: 'vben',
  at: '2026-08-20 09:10:00',
  id: 'a-2',
  summary: '删除用户「Ada, 测试」',
  target: 'user',
}

describe('auditToCsv', () => {
  it('writes Chinese labels and quotes the summary', () => {
    const csv = auditToCsv([auditCsvRow(row)])
    expect(csv.startsWith('\uFEFF')).toBe(true)
    expect(csv).toContain('时间,操作者,对象,动作,摘要')
    expect(csv).toContain('2026-08-20 09:10:00,vben,用户,删除,"删除用户「Ada, 测试」"')
  })
})

describe('parseAuditCsv', () => {
  it('round-trips an exported file', () => {
    const parsed = parseAuditCsv(auditToCsv([auditCsvRow(row)]))
    expect(parsed.rejected).toEqual([])
    expect(parsed.accepted).toEqual([
      {
        line: 2,
        value: {
          action: 'delete',
          actor: 'vben',
          at: '2026-08-20 09:10:00',
          summary: '删除用户「Ada, 测试」',
          target: 'user',
        },
      },
    ])
  })
})
