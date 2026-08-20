export type CsvRejected = {
  line: number
  message: string
}

export function csvEscape(value: string): string {
  const text = /^[=+\-@]/.test(value) ? `'${value}` : value
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`
  return text
}

export function stripBom(text: string): string {
  return text.startsWith('\uFEFF') ? text.slice(1) : text
}

export function stripFormulaPrefix(value: string): string {
  return /^'[=+\-@]/.test(value) ? value.slice(1) : value
}

export function parseStatusLabel(value: string): 0 | 1 | null {
  if (value === '启用') return 1
  if (value === '禁用') return 0
  return null
}

export function parseCsv(text: string): string[][] {
  const source = stripBom(text)
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let inQuotes = false

  for (let i = 0; i < source.length; i += 1) {
    const ch = source[i] ?? ''
    if (inQuotes) {
      if (ch === '"') {
        if (source[i + 1] === '"') {
          cell += '"'
          i += 1
        } else {
          inQuotes = false
        }
      } else {
        cell += ch
      }
      continue
    }
    if (ch === '"') {
      inQuotes = true
      continue
    }
    if (ch === ',') {
      row.push(cell)
      cell = ''
      continue
    }
    if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && source[i + 1] === '\n') i += 1
      row.push(cell)
      if (row.some((item) => item.length > 0)) rows.push(row)
      row = []
      cell = ''
      continue
    }
    cell += ch
  }

  if (inQuotes || cell.length > 0 || row.length > 0) {
    row.push(cell)
    if (row.some((item) => item.length > 0)) rows.push(row)
  }
  return rows
}

export function csvCell(cells: readonly string[], index: number): string {
  return stripFormulaPrefix((cells[index] ?? '').trim())
}

export function readCsvBody(
  text: string,
  header: readonly string[],
  max: number,
): { body: string[][]; rejected: CsvRejected[] } {
  const table = parseCsv(text)
  if (!table.length) {
    return { body: [], rejected: [{ line: 1, message: '文件是空的' }] }
  }
  const first = table[0] ?? []
  if (!header.every((title, index) => (first[index] ?? '').trim() === title)) {
    return { body: [], rejected: [{ line: 1, message: '表头必须是导出时的那一行' }] }
  }
  const all = table.slice(1)
  if (!all.length) {
    return { body: [], rejected: [{ line: 2, message: '没有数据行' }] }
  }
  const rejected: CsvRejected[] = []
  if (all.length > max) {
    rejected.push({
      line: max + 2,
      message: `最多导入 ${max} 条，多出的已忽略`,
    })
  }
  return { body: all.slice(0, max), rejected }
}

export function importCsvSummary(created: number, rejected: readonly CsvRejected[]): string {
  if (!rejected.length) return `导入成功 ${created} 条`
  const preview = rejected
    .slice(0, 3)
    .map((item) => `第 ${item.line} 行：${item.message}`)
    .join('；')
  return `导入成功 ${created} 条，跳过 ${rejected.length} 条。${preview}`
}

export function csvFileName(prefix: string, now: Date): string {
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${prefix}-${now.getFullYear()}${month}${day}.csv`
}

export function rowsToCsv(header: readonly string[], rows: readonly string[][]): string {
  const lines = [header.join(','), ...rows.map((row) => row.map(csvEscape).join(','))]
  return `\uFEFF${lines.join('\r\n')}\r\n`
}
