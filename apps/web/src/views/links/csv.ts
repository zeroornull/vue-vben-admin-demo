import {
  csvCell,
  importCsvSummary,
  parseStatusLabel,
  readCsvBody,
  rowsToCsv,
  type CsvRejected,
} from '../../tables/csv'

import { validateLinkForm, type EmbedLink, type LinkFormValues } from './query'

export { importCsvSummary }

export const LINK_CSV_MAX_ROWS = 100

export const LINK_CSV_HEADER = ['名称', '编码', '地址', '状态', '创建时间'] as const

export type LinkCsvRow = {
  code: string
  createTime: string
  iframeSrc: string
  status: string
  title: string
}

export function linkCsvRow(link: EmbedLink): LinkCsvRow {
  return {
    code: link.code,
    createTime: link.createTime,
    iframeSrc: link.iframeSrc,
    status: link.status === 1 ? '启用' : '禁用',
    title: link.title,
  }
}

export function linksToCsv(rows: LinkCsvRow[]): string {
  return rowsToCsv(
    LINK_CSV_HEADER,
    rows.map((row) => [row.title, row.code, row.iframeSrc, row.status, row.createTime]),
  )
}

export function parseLinkCsv(text: string): {
  accepted: { line: number; value: LinkFormValues }[]
  rejected: CsvRejected[]
} {
  const { body, rejected } = readCsvBody(text, LINK_CSV_HEADER, LINK_CSV_MAX_ROWS)
  const accepted: { line: number; value: LinkFormValues }[] = []
  for (const [index, cells] of body.entries()) {
    const line = index + 2
    const status = parseStatusLabel(csvCell(cells ?? [], 3))
    if (status === null) {
      rejected.push({ line, message: '状态只能是启用或禁用' })
      continue
    }
    const parsed = validateLinkForm({
      code: csvCell(cells ?? [], 1),
      iframeSrc: csvCell(cells ?? [], 2),
      status,
      title: csvCell(cells ?? [], 0),
    })
    if (!parsed.ok) rejected.push({ line, message: parsed.message })
    else accepted.push({ line, value: parsed.value })
  }
  return { accepted, rejected }
}
