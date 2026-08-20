import { csvCell, importCsvSummary, readCsvBody, rowsToCsv, type CsvRejected } from '../../tables/csv'

import {
  auditActionLabels,
  auditTargetLabels,
  validateAuditImportItem,
  type AuditEntry,
  type AuditImportItem,
} from './query'

export { importCsvSummary }

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

export function parseAuditCsv(text: string): {
  accepted: { line: number; value: AuditImportItem }[]
  rejected: CsvRejected[]
} {
  const { body, rejected } = readCsvBody(text, AUDIT_CSV_HEADER, AUDIT_CSV_MAX_ROWS)
  const accepted: { line: number; value: AuditImportItem }[] = []
  for (const [index, cells] of body.entries()) {
    const line = index + 2
    const parsed = validateAuditImportItem({
      action: csvCell(cells ?? [], 3),
      actor: csvCell(cells ?? [], 1),
      at: csvCell(cells ?? [], 0),
      summary: csvCell(cells ?? [], 4),
      target: csvCell(cells ?? [], 2),
    })
    if (!parsed.ok) rejected.push({ line, message: parsed.message })
    else accepted.push({ line, value: parsed.value })
  }
  return { accepted, rejected }
}
