import { validateUserForm } from './query'
import type { FormValidation, SystemUser, UserFormValues, UserStatus } from './types'

export const USER_CSV_MAX_ROWS = 100

export const USER_CSV_HEADER = ['用户名', '部门', '业务角色', '状态', '备注', '创建时间'] as const

export type UserCsvRow = {
  createTime: string
  dept: string
  name: string
  remark: string
  roles: string
  status: string
}

export function csvEscape(value: string): string {
  const text = /^[=+\-@]/.test(value) ? `'${value}` : value
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`
  return text
}

export function userCsvRow(
  user: SystemUser,
  deptLabel: string,
  roleLabel: string,
): UserCsvRow {
  return {
    createTime: user.createTime,
    dept: deptLabel,
    name: user.name,
    remark: user.remark,
    roles: roleLabel,
    status: user.status === 1 ? '启用' : '禁用',
  }
}

export function usersToCsv(rows: UserCsvRow[]): string {
  const lines = [
    USER_CSV_HEADER.join(','),
    ...rows.map((row) =>
      [row.name, row.dept, row.roles, row.status, row.remark, row.createTime]
        .map(csvEscape)
        .join(','),
    ),
  ]
  return `\uFEFF${lines.join('\r\n')}\r\n`
}

export function csvFileName(prefix: string, now: Date): string {
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${prefix}-${now.getFullYear()}${month}${day}.csv`
}

export function stripBom(text: string): string {
  return text.startsWith('\uFEFF') ? text.slice(1) : text
}

export function stripFormulaPrefix(value: string): string {
  return /^'[=+\-@]/.test(value) ? value.slice(1) : value
}

export function invertNameMap(byId: Map<string, string>): Map<string, string> {
  return new Map([...byId].map(([id, name]) => [name, id]))
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

export function parseStatusLabel(value: string): UserStatus | null {
  if (value === '启用') return 1
  if (value === '禁用') return 0
  return null
}

export type CsvNameLookup = {
  deptIdByName: Map<string, string>
  roleIdByName: Map<string, string>
}

export type UserCsvRejected = {
  line: number
  message: string
}

export type UserCsvAccepted = {
  line: number
  value: UserFormValues
}

export type UserCsvParseResult = {
  accepted: UserCsvAccepted[]
  rejected: UserCsvRejected[]
}

function headerMatches(cells: string[]): boolean {
  return USER_CSV_HEADER.every((title, index) => (cells[index] ?? '').trim() === title)
}

function rowToUserForm(cells: string[], lookup: CsvNameLookup): FormValidation {
  const name = stripFormulaPrefix((cells[0] ?? '').trim())
  const deptName = stripFormulaPrefix((cells[1] ?? '').trim())
  const rolesRaw = stripFormulaPrefix((cells[2] ?? '').trim())
  const statusLabel = stripFormulaPrefix((cells[3] ?? '').trim())
  const remark = stripFormulaPrefix((cells[4] ?? '').trim())
  const status = parseStatusLabel(statusLabel)
  if (status === null) {
    return { message: '状态只能是启用或禁用', ok: false }
  }

  let deptId: string | null = null
  if (deptName && deptName !== '未分配') {
    const id = lookup.deptIdByName.get(deptName)
    if (!id) return { message: `没有部门「${deptName}」`, ok: false }
    deptId = id
  }

  const roleIds: string[] = []
  if (rolesRaw && rolesRaw !== '未分配') {
    for (const label of rolesRaw
      .split('、')
      .map((item) => item.trim())
      .filter(Boolean)) {
      const id = lookup.roleIdByName.get(label)
      if (!id) return { message: `没有角色「${label}」`, ok: false }
      roleIds.push(id)
    }
  }

  return validateUserForm({ deptId, name, remark, roleIds, status })
}

export function parseUserCsv(text: string, lookup: CsvNameLookup): UserCsvParseResult {
  const table = parseCsv(text)
  if (!table.length) {
    return { accepted: [], rejected: [{ line: 1, message: '文件是空的' }] }
  }
  const header = table[0]
  if (!header || !headerMatches(header)) {
    return { accepted: [], rejected: [{ line: 1, message: '表头必须是导出时的那一行' }] }
  }
  const body = table.slice(1)
  if (!body.length) {
    return { accepted: [], rejected: [{ line: 2, message: '没有数据行' }] }
  }

  const accepted: UserCsvAccepted[] = []
  const rejected: UserCsvRejected[] = []
  const limited = body.slice(0, USER_CSV_MAX_ROWS)
  if (body.length > USER_CSV_MAX_ROWS) {
    rejected.push({
      line: USER_CSV_MAX_ROWS + 2,
      message: `最多导入 ${USER_CSV_MAX_ROWS} 条，多出的已忽略`,
    })
  }
  for (const [index, cells] of limited.entries()) {
    const line = index + 2
    const parsed = rowToUserForm(cells ?? [], lookup)
    if (!parsed.ok) rejected.push({ line, message: parsed.message })
    else accepted.push({ line, value: parsed.value })
  }
  return { accepted, rejected }
}

export function importCsvSummary(created: number, rejected: UserCsvRejected[]): string {
  if (!rejected.length) return `导入成功 ${created} 条`
  const preview = rejected
    .slice(0, 3)
    .map((item) => `第 ${item.line} 行：${item.message}`)
    .join('；')
  return `导入成功 ${created} 条，跳过 ${rejected.length} 条。${preview}`
}
