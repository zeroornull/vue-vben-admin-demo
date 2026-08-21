import {
  buildDeptTree,
  canAssignParent,
  deptDeleteBlocker,
  filterDeptTree,
  isDeptNameTaken,
  parseDeptQuery,
  validateDeptForm,
} from '../../../apps/web/src/views/depts/query.ts'
import type { DeptFormValues, SystemDept } from '../../../apps/web/src/views/depts/types.ts'

const seedDepts: SystemDept[] = [
  { createTime: '2024-01-02 09:00:00', id: 'd-1', name: '集团', parentId: null, remark: '根节点', status: 1 },
  { createTime: '2024-01-03 10:00:00', id: 'd-2', name: '产品', parentId: 'd-1', remark: '', status: 1 },
  { createTime: '2024-01-04 11:00:00', id: 'd-3', name: '设计', parentId: 'd-2', remark: '', status: 1 },
  { createTime: '2024-01-05 12:00:00', id: 'd-4', name: '研发', parentId: 'd-1', remark: '', status: 1 },
  { createTime: '2024-01-06 13:00:00', id: 'd-5', name: '前端', parentId: 'd-4', remark: '', status: 1 },
  { createTime: '2024-01-07 14:00:00', id: 'd-6', name: '后端', parentId: 'd-4', remark: '', status: 0 },
  { createTime: '2024-01-08 15:00:00', id: 'd-7', name: '运营', parentId: 'd-1', remark: '', status: 1 },
  { createTime: '2024-01-09 16:00:00', id: 'd-8', name: '支持', parentId: null, remark: '独立部门', status: 1 },
]

let depts: SystemDept[] = seedDepts.map((item) => ({ ...item }))
let nextId = depts.length + 1

function nowStamp(): string {
  const date = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

function readParentId(value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null
  return String(value)
}

export function listMockDeptFlat() {
  return depts.map((item) => ({ ...item }))
}

export function mockDeptExists(id: string) {
  return depts.some((item) => item.id === id)
}

export function listMockDepts(search: URLSearchParams) {
  return filterDeptTree(buildDeptTree(depts), parseDeptQuery(search))
}

export function createMockDept(input: DeptFormValues) {
  const checked = validateDeptForm({ ...input, parentId: readParentId(input.parentId) })
  if (!checked.ok) {
    return { error: checked.message }
  }
  if (!canAssignParent(depts, null, checked.value.parentId)) {
    return { error: '上级部门不存在' }
  }
  if (isDeptNameTaken(depts, checked.value.name, checked.value.parentId)) {
    return { error: '同级部门名称已存在' }
  }
  const dept: SystemDept = {
    createTime: nowStamp(),
    id: `d-${nextId}`,
    ...checked.value,
  }
  nextId += 1
  depts = [...depts, dept]
  return { dept }
}

export function updateMockDept(id: string, input: DeptFormValues) {
  const current = depts.find((item) => item.id === id)
  if (!current) {
    return { error: '部门不存在' }
  }
  const checked = validateDeptForm({ ...input, parentId: readParentId(input.parentId) })
  if (!checked.ok) {
    return { error: checked.message }
  }
  if (!canAssignParent(depts, id, checked.value.parentId)) {
    return { error: '不能选择自己或下级作为上级' }
  }
  if (isDeptNameTaken(depts, checked.value.name, checked.value.parentId, id)) {
    return { error: '同级部门名称已存在' }
  }
  const dept: SystemDept = { ...current, ...checked.value }
  depts = depts.map((item) => (item.id === id ? dept : item))
  return { dept }
}

export function mockDeptName(id: string) {
  return depts.find((item) => item.id === id)?.name
}

export function deleteMockDept(id: string, userCount = 0) {
  if (!depts.some((item) => item.id === id)) {
    return { error: '部门不存在' }
  }
  const blocked = deptDeleteBlocker(
    depts.some((item) => item.parentId === id),
    userCount,
  )
  if (blocked) {
    return { error: blocked }
  }
  depts = depts.filter((item) => item.id !== id)
  return { ok: true as const }
}
