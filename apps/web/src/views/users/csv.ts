import {
  csvCell,
  parseStatusLabel,
  readCsvBody,
  rowsToCsv,
  type CsvRejected,
} from '../../tables/csv'

import { validateUserForm } from './query'
import type { FormValidation, SystemUser, UserFormValues } from './types'

export {
  csvEscape,
  csvFileName,
  importCsvSummary,
  parseCsv,
  stripBom,
  stripFormulaPrefix,
} from '../../tables/csv'

export type UserCsvRejected = CsvRejected

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
  return rowsToCsv(
    USER_CSV_HEADER,
    rows.map((row) => [row.name, row.dept, row.roles, row.status, row.remark, row.createTime]),
  )
}

export function invertNameMap(byId: Map<string, string>): Map<string, string> {
  return new Map([...byId].map(([id, name]) => [name, id]))
}

export type CsvNameLookup = {
  deptIdByName: Map<string, string>
  roleIdByName: Map<string, string>
}

export type UserCsvAccepted = {
  line: number
  value: UserFormValues
}

export type UserCsvParseResult = {
  accepted: UserCsvAccepted[]
  rejected: UserCsvRejected[]
}

function rowToUserForm(cells: string[], lookup: CsvNameLookup): FormValidation {
  const name = csvCell(cells, 0)
  const deptName = csvCell(cells, 1)
  const rolesRaw = csvCell(cells, 2)
  const statusLabel = csvCell(cells, 3)
  const remark = csvCell(cells, 4)
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
  const { body, rejected } = readCsvBody(text, USER_CSV_HEADER, USER_CSV_MAX_ROWS)
  const accepted: UserCsvAccepted[] = []
  for (const [index, cells] of body.entries()) {
    const line = index + 2
    const parsed = rowToUserForm(cells ?? [], lookup)
    if (!parsed.ok) rejected.push({ line, message: parsed.message })
    else accepted.push({ line, value: parsed.value })
  }
  return { accepted, rejected }
}
