import { seedActionCodes, seedMenuCodes } from '@app/access/catalog'
import {
  isRoleCodeTaken,
  isRoleNameTaken,
  parseRoleListQuery,
  queryRoles,
  roleDeleteBlocker,
  validateRoleForm,
} from '../../../apps/web/src/views/roles/query.ts'
import type { RoleFormValues, SystemRole } from '../../../apps/web/src/views/roles/types.ts'

const seedRoles: SystemRole[] = [
  {
    code: 'biz-admin',
    createTime: '2024-01-02 09:00:00',
    id: 'r-1',
    actionCodes: seedActionCodes('biz-admin'),
    menuCodes: seedMenuCodes('biz-admin'),
    name: '业务管理员',
    remark: '系统业务权限',
    status: 1,
  },
  {
    code: 'editor',
    createTime: '2024-01-03 10:00:00',
    id: 'r-2',
    actionCodes: seedActionCodes('editor'),
    menuCodes: seedMenuCodes('editor'),
    name: '编辑',
    remark: '',
    status: 1,
  },
  {
    code: 'viewer',
    createTime: '2024-01-04 11:00:00',
    id: 'r-3',
    actionCodes: seedActionCodes('viewer'),
    menuCodes: seedMenuCodes('viewer'),
    name: '访客',
    remark: '',
    status: 1,
  },
]

let roles: SystemRole[] = seedRoles.map((item) => ({ ...item }))
let nextId = roles.length + 1

function nowStamp(): string {
  const date = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

export function listMockRoles(search: URLSearchParams) {
  return queryRoles(roles, parseRoleListQuery(search))
}

export function listMockRoleFlat() {
  return roles.map((item) => ({ ...item }))
}

export function mockRoleExists(id: string) {
  return roles.some((item) => item.id === id)
}

export function createMockRole(input: RoleFormValues) {
  const checked = validateRoleForm(input)
  if (!checked.ok) {
    return { error: checked.message }
  }
  if (isRoleNameTaken(roles, checked.value.name)) {
    return { error: '角色名称已存在' }
  }
  if (isRoleCodeTaken(roles, checked.value.code)) {
    return { error: '角色编码已存在' }
  }
  const role: SystemRole = {
    createTime: nowStamp(),
    id: `r-${nextId}`,
    ...checked.value,
  }
  nextId += 1
  roles = [role, ...roles]
  return { role }
}

export function updateMockRole(id: string, input: RoleFormValues) {
  const current = roles.find((item) => item.id === id)
  if (!current) {
    return { error: '角色不存在' }
  }
  const checked = validateRoleForm({ ...input, code: current.code })
  if (!checked.ok) {
    return { error: checked.message }
  }
  if (isRoleNameTaken(roles, checked.value.name, id)) {
    return { error: '角色名称已存在' }
  }
  const role: SystemRole = { ...current, ...checked.value, code: current.code }
  roles = roles.map((item) => (item.id === id ? role : item))
  return { role }
}

export function mockRoleName(id: string) {
  return roles.find((item) => item.id === id)?.name
}

export function deleteMockRole(id: string, userCount = 0) {
  if (!roles.some((item) => item.id === id)) {
    return { error: '角色不存在' }
  }
  const blocked = roleDeleteBlocker(userCount)
  if (blocked) {
    return { error: blocked }
  }
  roles = roles.filter((item) => item.id !== id)
  return { ok: true as const }
}
