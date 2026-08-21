import { BATCH_DELETE_MAX, nextPageAfterDeletes, normalizeIds } from '@app/tables/batch'
import { parseSortParams, sortListByQuery, TABLE_SORT_FIELDS } from '@app/tables/sort'

import type {
  FormValidation,
  SystemUser,
  UserFormValues,
  UserListQuery,
  UserListResult,
  UserStatus,
} from './types'

export function emptyUserForm(): UserFormValues {
  return { deptId: null, name: '', remark: '', roleIds: [], status: 1 }
}

export function formFromUser(user: SystemUser): UserFormValues {
  return {
    deptId: user.deptId,
    name: user.name,
    remark: user.remark,
    roleIds: [...user.roleIds],
    status: user.status,
  }
}

export function normalizeRoleIds(ids: unknown): string[] {
  if (!Array.isArray(ids)) return []
  return [...new Set(ids.map((id) => String(id).trim()).filter(Boolean))]
}

export function matchesRole(roleIds: string[], selected: string): boolean {
  if (!selected) return true
  return roleIds.includes(selected)
}

export function countUsersInRole(users: SystemUser[], roleId: string): number {
  return users.filter((item) => item.roleIds.includes(roleId)).length
}

export function parseUserListQuery(search: URLSearchParams): UserListQuery {
  const page = Math.max(1, Number.parseInt(search.get('page') ?? '1', 10) || 1)
  const pageSize = Math.min(
    100,
    Math.max(1, Number.parseInt(search.get('pageSize') ?? '10', 10) || 10),
  )
  const name = (search.get('name') ?? '').trim()
  const deptId = (search.get('deptId') ?? '').trim()
  const roleId = (search.get('roleId') ?? '').trim()
  const statusRaw = search.get('status')
  const status: UserStatus | '' = statusRaw === '0' || statusRaw === '1' ? Number(statusRaw) as UserStatus : ''
  return { deptId, name, page, pageSize, roleId, status, ...parseSortParams(search, TABLE_SORT_FIELDS.users) }
}

export function matchesDeptScope(
  deptId: string | null,
  selectedDeptId: string,
  descendantIds: readonly string[] = [],
): boolean {
  if (!selectedDeptId) return true
  if (!deptId) return false
  return deptId === selectedDeptId || descendantIds.includes(deptId)
}

export function countUsersInDept(users: SystemUser[], deptId: string): number {
  return users.filter((item) => item.deptId === deptId).length
}

export function filterUsers(
  list: SystemUser[],
  query: Pick<UserListQuery, 'deptId' | 'name' | 'roleId' | 'status'>,
  descendantIds: readonly string[] = [],
): SystemUser[] {
  const keyword = query.name.trim().toLowerCase()
  return list.filter((item) => {
    if (keyword && !item.name.toLowerCase().includes(keyword)) {
      return false
    }
    if (query.status === 0 || query.status === 1) {
      if (item.status !== query.status) return false
    }
    if (!matchesRole(item.roleIds, query.roleId)) return false
    return matchesDeptScope(item.deptId, query.deptId, descendantIds)
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

export function queryUsers(
  list: SystemUser[],
  query: UserListQuery,
  descendantIds: readonly string[] = [],
): UserListResult {
  const filtered = filterUsers(list, query, descendantIds)
  const sorted = sortListByQuery(filtered, query, TABLE_SORT_FIELDS.users)
  const page = paginateList(sorted, query.page, query.pageSize)
  return { items: page.items, total: page.total }
}

export function validateUserForm(values: UserFormValues): FormValidation {
  const name = values.name.trim()
  if (!name) {
    return { message: '请输入用户名', ok: false }
  }
  if (name.length > 32) {
    return { message: '用户名最多 32 个字', ok: false }
  }
  return {
    ok: true,
    value: {
      deptId: values.deptId || null,
      name,
      remark: values.remark.trim(),
      roleIds: normalizeRoleIds(values.roleIds),
      status: values.status === 0 ? 0 : 1,
    },
  }
}

export function isUserNameTaken(
  list: SystemUser[],
  name: string,
  exceptId?: string,
): boolean {
  return list.some((item) => item.name === name && item.id !== exceptId)
}

export const USER_BATCH_DELETE_MAX = BATCH_DELETE_MAX
export const normalizeUserIds = normalizeIds
export { nextPageAfterDeletes }

export function batchDeleteConfirmText(count: number): string {
  return `确定删除选中的 ${count} 人？内存 mock，刷新后种子会回来。`
}
