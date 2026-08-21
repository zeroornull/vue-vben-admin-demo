import { BATCH_DELETE_MAX, batchDeleteConfirmText, normalizeIds } from '@app/tables/batch'

import type {
  DeptFormValues,
  DeptListQuery,
  FormValidation,
  ParentOption,
  SystemDept,
  UserStatus,
} from './types'

export function emptyDeptForm(parentId: string | null = null): DeptFormValues {
  return { name: '', parentId, remark: '', status: 1 }
}

export function formFromDept(dept: SystemDept): DeptFormValues {
  return {
    name: dept.name,
    parentId: dept.parentId,
    remark: dept.remark,
    status: dept.status,
  }
}

export function parseDeptQuery(search: URLSearchParams): DeptListQuery {
  const name = (search.get('name') ?? '').trim()
  const statusRaw = search.get('status')
  const status: UserStatus | '' =
    statusRaw === '0' || statusRaw === '1' ? (Number(statusRaw) as UserStatus) : ''
  return { name, status }
}

export function buildDeptTree(flat: SystemDept[]): SystemDept[] {
  const nodes = new Map<string, SystemDept>()
  for (const item of flat) {
    nodes.set(item.id, { ...item, children: [] })
  }
  const roots: SystemDept[] = []
  for (const node of nodes.values()) {
    const parent = node.parentId ? nodes.get(node.parentId) : undefined
    if (parent) {
      parent.children = [...(parent.children ?? []), node]
    } else {
      roots.push(node)
    }
  }
  return roots
}

export function flattenDepts(tree: SystemDept[]): SystemDept[] {
  const list: SystemDept[] = []
  const walk = (nodes: SystemDept[]) => {
    for (const node of nodes) {
      const { children: _children, ...rest } = node
      list.push(rest)
      if (node.children?.length) walk(node.children)
    }
  }
  walk(tree)
  return list
}

export function findDept(nodes: SystemDept[], id: string): SystemDept | undefined {
  for (const node of nodes) {
    if (node.id === id) return node
    const nested = findDept(node.children ?? [], id)
    if (nested) return nested
  }
  return undefined
}

export function collectDescendantIds(flat: SystemDept[], id: string): string[] {
  const ids: string[] = []
  for (const child of flat.filter((item) => item.parentId === id)) {
    ids.push(child.id, ...collectDescendantIds(flat, child.id))
  }
  return ids
}

export function canAssignParent(
  flat: SystemDept[],
  deptId: string | null,
  parentId: string | null,
): boolean {
  if (!parentId) return true
  if (!flat.some((item) => item.id === parentId)) return false
  if (!deptId) return true
  if (parentId === deptId) return false
  return !collectDescendantIds(flat, deptId).includes(parentId)
}

export function isDeptNameTaken(
  flat: SystemDept[],
  name: string,
  parentId: string | null,
  exceptId?: string,
): boolean {
  return flat.some(
    (item) =>
      item.name === name && item.parentId === parentId && item.id !== exceptId,
  )
}

export function filterDeptTree(tree: SystemDept[], query: DeptListQuery): SystemDept[] {
  const keyword = query.name.trim().toLowerCase()
  const matches = (node: SystemDept) => {
    if (keyword && !node.name.toLowerCase().includes(keyword)) return false
    if (query.status === 0 || query.status === 1) return node.status === query.status
    return true
  }
  const walk = (nodes: SystemDept[]): SystemDept[] => {
    const result: SystemDept[] = []
    for (const node of nodes) {
      const children = walk(node.children ?? [])
      if (matches(node) || children.length) {
        result.push({ ...node, children })
      }
    }
    return result
  }
  return walk(tree)
}

export function toParentOptions(
  tree: SystemDept[],
  disabledIds: ReadonlySet<string> = new Set(),
): ParentOption[] {
  return tree.map((node) => ({
    children: node.children?.length
      ? toParentOptions(node.children, disabledIds)
      : undefined,
    disabled: disabledIds.has(node.id),
    title: node.name,
    value: node.id,
  }))
}

export function disabledParentIds(flat: SystemDept[], deptId: string | null): Set<string> {
  if (!deptId) return new Set()
  return new Set([deptId, ...collectDescendantIds(flat, deptId)])
}

export function deptNameById(flat: SystemDept[]): Map<string, string> {
  return new Map(flat.map((item) => [item.id, item.name]))
}

export function deptDeleteBlocker(hasChildren: boolean, userCount: number): string | null {
  if (hasChildren) return '请先删除下级部门'
  if (userCount > 0) return '请先移走该部门下的用户'
  return null
}

export const DEPT_BATCH_DELETE_MAX = BATCH_DELETE_MAX

export function batchDeleteDeptsConfirmText(count: number): string {
  return batchDeleteConfirmText(count, '个部门')
}

export function deptDepthMap(flat: { id: string; parentId: string | null }[]): Map<string, number> {
  const parentById = new Map(flat.map((item) => [item.id, item.parentId]))
  const depths = new Map<string, number>()
  const depthOf = (id: string, stack: Set<string>): number => {
    const cached = depths.get(id)
    if (cached != null) return cached
    if (stack.has(id)) return 0
    const parent = parentById.get(id)
    if (!parent || !parentById.has(parent)) {
      depths.set(id, 0)
      return 0
    }
    stack.add(id)
    const next = depthOf(parent, stack) + 1
    stack.delete(id)
    depths.set(id, next)
    return next
  }
  for (const item of flat) depthOf(item.id, new Set())
  return depths
}

export function orderDeptIdsForDelete(
  ids: unknown,
  flat: { id: string; parentId: string | null }[],
): string[] {
  const depths = deptDepthMap(flat)
  return normalizeIds(ids).sort((left, right) => (depths.get(right) ?? 0) - (depths.get(left) ?? 0))
}

export function validateDeptForm(values: DeptFormValues): FormValidation {
  const name = values.name.trim()
  if (!name) {
    return { message: '请输入部门名称', ok: false }
  }
  if (name.length > 32) {
    return { message: '部门名称最多 32 个字', ok: false }
  }
  return {
    ok: true,
    value: {
      name,
      parentId: values.parentId || null,
      remark: values.remark.trim(),
      status: values.status === 0 ? 0 : 1,
    },
  }
}
