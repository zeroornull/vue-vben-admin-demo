import { collectDescendantIds } from '../../../apps/web/src/views/depts/query.ts'
import {
  countUsersInDept,
  countUsersInRole,
  isUserNameTaken,
  parseUserListQuery,
  queryUsers,
  validateUserForm,
} from '../../../apps/web/src/views/users/query.ts'
import type { SystemUser, UserFormValues } from '../../../apps/web/src/views/users/types.ts'

import { listMockDeptFlat, mockDeptExists } from './depts-store.ts'
import { mockRoleExists } from './roles-store.ts'

const seedUsers: SystemUser[] = [
  { createTime: '2024-01-02 09:00:00', deptId: 'd-2', id: 'u-1', name: 'Alice', remark: '产品', roleIds: ['r-1'], status: 1 },
  { createTime: '2024-01-05 10:12:00', deptId: 'd-3', id: 'u-2', name: 'Bob', remark: '设计', roleIds: ['r-2'], status: 1 },
  { createTime: '2024-02-11 14:03:00', deptId: 'd-5', id: 'u-3', name: 'Carol', remark: '前端', roleIds: ['r-3'], status: 0 },
  { createTime: '2024-03-08 08:40:00', deptId: 'd-6', id: 'u-4', name: 'Dave', remark: '后端', roleIds: ['r-2'], status: 1 },
  { createTime: '2024-03-19 16:21:00', deptId: 'd-4', id: 'u-5', name: 'Eve', remark: '测试', roleIds: ['r-2', 'r-3'], status: 0 },
  { createTime: '2024-04-01 11:08:00', deptId: 'd-7', id: 'u-6', name: 'Frank', remark: '运维', roleIds: ['r-3'], status: 1 },
  { createTime: '2024-04-22 13:55:00', deptId: 'd-4', id: 'u-7', name: 'Grace', remark: '数据', roleIds: ['r-1'], status: 1 },
  { createTime: '2024-05-03 09:17:00', deptId: 'd-7', id: 'u-8', name: 'Heidi', remark: '运营', roleIds: ['r-3'], status: 0 },
  { createTime: '2024-05-18 15:44:00', deptId: 'd-8', id: 'u-9', name: 'Ivan', remark: '支持', roleIds: ['r-3'], status: 1 },
  { createTime: '2024-06-07 10:02:00', deptId: 'd-1', id: 'u-10', name: 'Judy', remark: '市场', roleIds: ['r-1'], status: 1 },
  { createTime: '2024-06-29 18:30:00', deptId: 'd-8', id: 'u-11', name: 'Mallory', remark: '安全', roleIds: ['r-1'], status: 0 },
  { createTime: '2024-07-14 07:51:00', deptId: null, id: 'u-12', name: 'Oscar', remark: '顾问', roleIds: [], status: 1 },
]

let users: SystemUser[] = seedUsers.map((item) => ({ ...item }))
let nextId = users.length + 1

function nowStamp(): string {
  const date = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

function readDeptId(value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null
  return String(value)
}

export function listMockUsers(search: URLSearchParams) {
  const query = parseUserListQuery(search)
  const descendants = query.deptId
    ? collectDescendantIds(listMockDeptFlat(), query.deptId)
    : []
  return queryUsers(users, query, descendants)
}

export function countMockUsersInDept(deptId: string) {
  return countUsersInDept(users, deptId)
}

export function countMockUsersInRole(roleId: string) {
  return countUsersInRole(users, roleId)
}

function assertRolesExist(roleIds: string[]) {
  return roleIds.every((id) => mockRoleExists(id))
}

export function createMockUser(input: UserFormValues) {
  const checked = validateUserForm({ ...input, deptId: readDeptId(input.deptId) })
  if (!checked.ok) {
    return { error: checked.message }
  }
  if (checked.value.deptId && !mockDeptExists(checked.value.deptId)) {
    return { error: '部门不存在' }
  }
  if (!assertRolesExist(checked.value.roleIds)) {
    return { error: '角色不存在' }
  }
  if (isUserNameTaken(users, checked.value.name)) {
    return { error: '用户名已存在' }
  }
  const user: SystemUser = {
    createTime: nowStamp(),
    id: `u-${nextId}`,
    ...checked.value,
  }
  nextId += 1
  users = [user, ...users]
  return { user }
}

export function updateMockUser(id: string, input: UserFormValues) {
  const current = users.find((item) => item.id === id)
  if (!current) {
    return { error: '用户不存在' }
  }
  const checked = validateUserForm({ ...input, deptId: readDeptId(input.deptId) })
  if (!checked.ok) {
    return { error: checked.message }
  }
  if (checked.value.deptId && !mockDeptExists(checked.value.deptId)) {
    return { error: '部门不存在' }
  }
  if (!assertRolesExist(checked.value.roleIds)) {
    return { error: '角色不存在' }
  }
  if (isUserNameTaken(users, checked.value.name, id)) {
    return { error: '用户名已存在' }
  }
  const user: SystemUser = { ...current, ...checked.value }
  users = users.map((item) => (item.id === id ? user : item))
  return { user }
}

export function mockUserName(id: string) {
  return users.find((item) => item.id === id)?.name
}

export function deleteMockUser(id: string) {
  if (!users.some((item) => item.id === id)) {
    return { error: '用户不存在' }
  }
  users = users.filter((item) => item.id !== id)
  return { ok: true as const }
}
