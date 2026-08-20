import { rowsToCsv } from '../../tables/csv'

import { auditActionLabels, auditTargetLabels, type AuditEntry } from './query'

export const AUDIT_CSV_MAX_ROWS = 100

export const AUDIT_CSV_HEADER = ['时间', '操作者', '对象', '动作', '摘要'] as const

export type AuditCsvRow = {
  action: string
  actor: string
  at: string
  summary: string
  target: string
}

export function auditCsvRow(entry: AuditEntry): AuditCsvRow {
  return {
    action: auditActionLabels[entry.action],
    actor: entry.actor,
    at: entry.at,
    summary: entry.summary,
    target: auditTargetLabels[entry.target],
  }
}

export function auditToCsv(rows: AuditCsvRow[]): string {
  return rowsToCsv(
    AUDIT_CSV_HEADER,
    rows.map((row) => [row.at, row.actor, row.target, row.action, row.summary]),
  )
}
