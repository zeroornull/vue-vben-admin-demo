import { isActionCode, isMenuCode } from '../../access/catalog'
import { grantParentMenus, sanitizeActionCodes, uniqueCodes } from '../../access/resolve'
import { BATCH_DELETE_MAX, batchDeleteConfirmText } from '../../tables/batch'
import { parseSortParams, sortListByQuery, TABLE_SORT_FIELDS } from '../../tables/sort'

import type {
  FormValidation,
  RoleFormValues,
  RoleListQuery,
  RoleListResult,
  SystemRole,
  UserStatus,
} from './types'

/** 留给登录守卫的 meta.roles，系统角色编码不要占用 */
export const reservedRoleCodes = ['admin', 'user'] as const

const codePattern = /^[a-z][a-z0-9-]{1,31}$/

export function emptyRoleForm(): RoleFormValues {
  return { actionCodes: [], code: '', menuCodes: [], name: '', remark: '', status: 1 }
}

export function formFromRole(role: SystemRole): RoleFormValues {
  return {
    actionCodes: [...role.actionCodes],
    code: role.code,
    menuCodes: [...role.menuCodes],
    name: role.name,
    remark: role.remark,
    status: role.status,
  }
}

export function parseRoleListQuery(search: URLSearchParams): RoleListQuery {
  const page = Math.max(1, Number.parseInt(search.get('page') ?? '1', 10) || 1)
  const pageSize = Math.min(
    100,
    Math.max(1, Number.parseInt(search.get('pageSize') ?? '10', 10) || 10),
  )
  const name = (search.get('name') ?? '').trim()
  const code = (search.get('code') ?? '').trim()
  const statusRaw = search.get('status')
  const status: UserStatus | '' =
    statusRaw === '0' || statusRaw === '1' ? (Number(statusRaw) as UserStatus) : ''
  return { code, name, page, pageSize, status, ...parseSortParams(search, TABLE_SORT_FIELDS.roles) }
}

export function filterRoles(
  list: SystemRole[],
  query: Pick<RoleListQuery, 'code' | 'name' | 'status'>,
): SystemRole[] {
  const name = query.name.trim().toLowerCase()
  const code = query.code.trim().toLowerCase()
  return list.filter((item) => {
    if (name && !item.name.toLowerCase().includes(name)) return false
    if (code && !item.code.toLowerCase().includes(code)) return false
    if (query.status === 0 || query.status === 1) return item.status === query.status
    return true
  })
}

export function paginateList<T>(
  list: T[],
  page: number,
  pageSize: number,
): { items: T[]; page: number; pageSize: number; total: number } {
  const current = Math.max(1, page)
  const size = Math.min(100, Math.max(1, pageSize))
  const start = (current - 1) * size
  return {
    items: list.slice(start, start + size),
    page: current,
    pageSize: size,
    total: list.length,
  }
}

export function queryRoles(list: SystemRole[], query: RoleListQuery): RoleListResult {
  const filtered = filterRoles(list, query)
  const sorted = sortListByQuery(filtered, query, TABLE_SORT_FIELDS.roles)
  const page = paginateList(sorted, query.page, query.pageSize)
  return { items: page.items, total: page.total }
}

export function roleNameById(roles: SystemRole[]): Map<string, string> {
  return new Map(roles.map((item) => [item.id, item.name]))
}

export function roleDeleteBlocker(userCount: number): string | null {
  if (userCount > 0) return '请先移走拥有该角色的用户'
  return null
}

export const ROLE_BATCH_DELETE_MAX = BATCH_DELETE_MAX

export function batchDeleteRolesConfirmText(count: number): string {
  return batchDeleteConfirmText(count, '个角色')
}

export function isRoleNameTaken(
  list: SystemRole[],
  name: string,
  exceptId?: string,
): boolean {
  return list.some((item) => item.name === name && item.id !== exceptId)
}

export function isRoleCodeTaken(
  list: SystemRole[],
  code: string,
  exceptId?: string,
): boolean {
  return list.some((item) => item.code === code && item.id !== exceptId)
}

export function validateRoleForm(values: RoleFormValues): FormValidation {
  const name = values.name.trim()
  const code = values.code.trim().toLowerCase()
  if (!name) {
    return { message: '请输入角色名称', ok: false }
  }
  if (name.length > 32) {
    return { message: '角色名称最多 32 个字', ok: false }
  }
  if (!codePattern.test(code)) {
    return { message: '编码以小写字母开头，只含小写字母、数字和连字符', ok: false }
  }
  if ((reservedRoleCodes as readonly string[]).includes(code)) {
    return { message: '编码 admin / user 留给登录权限，请换一个', ok: false }
  }
  const rawMenus = Array.isArray(values.menuCodes) ? values.menuCodes.map(String) : []
  if (rawMenus.some((item) => !isMenuCode(item))) {
    return { message: '含有未知菜单权限', ok: false }
  }
  const rawActions = Array.isArray(values.actionCodes) ? values.actionCodes.map(String) : []
  if (rawActions.some((item) => !isActionCode(item))) {
    return { message: '含有未知操作权限', ok: false }
  }
  const actionCodes = sanitizeActionCodes(uniqueCodes(rawActions))
  return {
    ok: true,
    value: {
      actionCodes,
      code,
      menuCodes: grantParentMenus(uniqueCodes(rawMenus), actionCodes),
      name,
      remark: values.remark.trim(),
      status: values.status === 0 ? 0 : 1,
    },
  }
}
