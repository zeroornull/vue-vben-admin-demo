import { actionCatalog, menuCatalog } from '../../access/catalog'
import {
  csvCell,
  importCsvSummary,
  parseStatusLabel,
  readCsvBody,
  rowsToCsv,
  type CsvRejected,
} from '../../tables/csv'
import { validateRoleForm } from './query'
import type { RoleFormValues, SystemRole } from './types'

export { importCsvSummary }

export const ROLE_CSV_MAX_ROWS = 100

export const ROLE_CSV_HEADER = [
  '角色名称',
  '编码',
  '菜单',
  '操作权限',
  '状态',
  '备注',
  '创建时间',
] as const

export type RoleCsvRow = {
  actions: string
  code: string
  createTime: string
  menus: string
  name: string
  remark: string
  status: string
}

export function roleCsvRow(role: SystemRole, menus: string, actions: string): RoleCsvRow {
  return {
    actions,
    code: role.code,
    createTime: role.createTime,
    menus,
    name: role.name,
    remark: role.remark,
    status: role.status === 1 ? '启用' : '禁用',
  }
}

export function rolesToCsv(rows: RoleCsvRow[]): string {
  return rowsToCsv(
    ROLE_CSV_HEADER,
    rows.map((row) => [
      row.name,
      row.code,
      row.menus,
      row.actions,
      row.status,
      row.remark,
      row.createTime,
    ]),
  )
}

export function parseMenuLabels(text: string): { ok: true; codes: string[] } | { ok: false; message: string } {
  const raw = text.trim()
  if (!raw || raw === '无') return { ok: true, codes: [] }
  const codes: string[] = []
  for (const label of raw
    .split('、')
    .map((item) => item.trim())
    .filter(Boolean)) {
    const code = menuCatalog.find((item) => item.title === label)?.code
    if (!code) return { ok: false, message: `没有菜单「${label}」` }
    codes.push(code)
  }
  return { ok: true, codes }
}

export function parseActionLabels(text: string): { ok: true; codes: string[] } | { ok: false; message: string } {
  const raw = text.trim()
  if (!raw || raw === '无') return { ok: true, codes: [] }
  const codes: string[] = []
  for (const group of raw
    .split(/[；;]/)
    .map((item) => item.trim())
    .filter(Boolean)) {
    const match = /^(.+?)[：:](.*)$/.exec(group)
    if (!match) return { ok: false, message: '操作权限格式不对，应是「用户：新建/编辑」' }
    const menuTitle = (match[1] ?? '').trim()
    const acts = match[2] ?? ''
    const menu = menuCatalog.find((item) => item.title === menuTitle)
    if (!menu) return { ok: false, message: `没有菜单「${menuTitle}」` }
    for (const title of acts
      .split('/')
      .map((item) => item.trim())
      .filter(Boolean)) {
      const action = actionCatalog.find((item) => item.menuCode === menu.code && item.title === title)
      if (!action) return { ok: false, message: `菜单「${menuTitle}」没有操作「${title}」` }
      codes.push(action.code)
    }
  }
  return { ok: true, codes }
}

function rowToRoleForm(cells: string[]): { ok: true; value: RoleFormValues } | { ok: false; message: string } {
  const name = csvCell(cells, 0)
  const code = csvCell(cells, 1)
  const menus = parseMenuLabels(csvCell(cells, 2))
  if (!menus.ok) return menus
  const actions = parseActionLabels(csvCell(cells, 3))
  if (!actions.ok) return actions
  const status = parseStatusLabel(csvCell(cells, 4))
  if (status === null) return { message: '状态只能是启用或禁用', ok: false }
  return validateRoleForm({
    actionCodes: actions.codes,
    code,
    menuCodes: menus.codes,
    name,
    remark: csvCell(cells, 5),
    status,
  })
}

export function parseRoleCsv(text: string): {
  accepted: { line: number; value: RoleFormValues }[]
  rejected: CsvRejected[]
} {
  const { body, rejected } = readCsvBody(text, ROLE_CSV_HEADER, ROLE_CSV_MAX_ROWS)
  const accepted: { line: number; value: RoleFormValues }[] = []
  for (const [index, cells] of body.entries()) {
    const line = index + 2
    const parsed = rowToRoleForm(cells ?? [])
    if (!parsed.ok) rejected.push({ line, message: parsed.message })
    else accepted.push({ line, value: parsed.value })
  }
  return { accepted, rejected }
}
