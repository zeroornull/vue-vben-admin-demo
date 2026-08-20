import {
  csvCell,
  importCsvSummary,
  parseStatusLabel,
  readCsvBody,
  rowsToCsv,
  type CsvRejected,
} from '../../tables/csv'
import { deptNameById, flattenDepts } from './query'
import type { DeptFormValues, FormValidation, SystemDept } from './types'

export { importCsvSummary }

export const DEPT_CSV_MAX_ROWS = 100

export const DEPT_CSV_HEADER = [
  '部门名称',
  '上级',
  '路径',
  '人数',
  '状态',
  '备注',
  '创建时间',
] as const

export type DeptCsvRow = {
  createTime: string
  name: string
  parent: string
  path: string
  remark: string
  status: string
  userCount: string
}

export type DeptCsvDraft = {
  line: number
  name: string
  parentLabel: string
  path: string
  remark: string
  status: 0 | 1
}

export type DeptNameLookup = {
  byName: Map<string, string[]>
  byPath: Map<string, string>
  names: Map<string, string>
  parents: Map<string, string | null>
}

export function deptParentById(flat: SystemDept[]): Map<string, string | null> {
  return new Map(flat.map((item) => [item.id, item.parentId]))
}

export function deptParentLabel(parentId: string | null, names: Map<string, string>): string {
  if (!parentId) return '无'
  return names.get(parentId) ?? parentId
}

export function deptPath(
  id: string,
  names: Map<string, string>,
  parents: Map<string, string | null>,
  separator = ' / ',
): string {
  const parts: string[] = []
  const seen = new Set<string>()
  let current: string | null = id
  while (current && !seen.has(current)) {
    seen.add(current)
    const name = names.get(current)
    if (name) parts.unshift(name)
    current = parents.get(current) ?? null
  }
  return parts.join(separator)
}

export function deptCsvRow(
  dept: SystemDept,
  names: Map<string, string>,
  parents: Map<string, string | null>,
): DeptCsvRow {
  return {
    createTime: dept.createTime,
    name: dept.name,
    parent: deptParentLabel(dept.parentId, names),
    path: deptPath(dept.id, names, parents),
    remark: dept.remark,
    status: dept.status === 1 ? '启用' : '禁用',
    userCount: String(dept.userCount ?? 0),
  }
}

export function deptsToCsv(rows: DeptCsvRow[]): string {
  return rowsToCsv(
    DEPT_CSV_HEADER,
    rows.map((row) => [
      row.name,
      row.parent,
      row.path,
      row.userCount,
      row.status,
      row.remark,
      row.createTime,
    ]),
  )
}

export function deptsForCsv(tree: SystemDept[], catalog: SystemDept[], max = DEPT_CSV_MAX_ROWS) {
  const all = flattenDepts(catalog)
  const names = deptNameById(all)
  const parents = deptParentById(all)
  const visible = flattenDepts(tree)
  return {
    rows: visible.slice(0, max).map((dept) => deptCsvRow(dept, names, parents)),
    total: visible.length,
  }
}

export function emptyDeptLookup(): DeptNameLookup {
  return {
    byName: new Map(),
    byPath: new Map(),
    names: new Map(),
    parents: new Map(),
  }
}

export function addDeptToLookup(
  lookup: DeptNameLookup,
  dept: Pick<SystemDept, 'id' | 'name' | 'parentId'>,
) {
  lookup.names.set(dept.id, dept.name)
  lookup.parents.set(dept.id, dept.parentId)
  const ids = lookup.byName.get(dept.name) ?? []
  if (!ids.includes(dept.id)) ids.push(dept.id)
  lookup.byName.set(dept.name, ids)
  lookup.byPath.set(deptPath(dept.id, lookup.names, lookup.parents), dept.id)
}

export function deptLookupFromCatalog(catalog: SystemDept[]): DeptNameLookup {
  const lookup = emptyDeptLookup()
  for (const dept of flattenDepts(catalog)) addDeptToLookup(lookup, dept)
  return lookup
}

export function splitDeptPath(path: string): string[] {
  return path
    .split('/')
    .map((part) => part.trim())
    .filter(Boolean)
}

export function parentPathOf(path: string): string {
  const parts = splitDeptPath(path)
  if (parts.length < 2) return ''
  return parts.slice(0, -1).join(' / ')
}

export function deptImportDepth(draft: Pick<DeptCsvDraft, 'parentLabel' | 'path'>): number {
  const parts = splitDeptPath(draft.path)
  if (parts.length) return parts.length
  return draft.parentLabel ? 1 : 0
}

export function orderDeptDraftsForImport(drafts: readonly DeptCsvDraft[]): DeptCsvDraft[] {
  return [...drafts].sort((left, right) => {
    const delta = deptImportDepth(left) - deptImportDepth(right)
    return delta || left.line - right.line
  })
}

function siblingTaken(lookup: DeptNameLookup, name: string, parentId: string | null): boolean {
  return [...lookup.names].some(
    ([id, current]) => current === name && (lookup.parents.get(id) ?? null) === parentId,
  )
}

export function resolveDeptParent(
  draft: Pick<DeptCsvDraft, 'name' | 'parentLabel' | 'path'>,
  lookup: DeptNameLookup,
): { ok: true; parentId: string | null } | { ok: false; message: string } {
  const parts = splitDeptPath(draft.path)
  if (parts.length && parts[parts.length - 1] !== draft.name) {
    return { ok: false, message: '路径末级与部门名称不一致' }
  }

  if (!draft.parentLabel) {
    if (parts.length > 1) return { ok: false, message: '根部门的路径只能是自身名称' }
    return { ok: true, parentId: null }
  }

  const ids = lookup.byName.get(draft.parentLabel) ?? []
  const parentPath = parentPathOf(draft.path)
  if (ids.length === 1) {
    const parentId = ids[0] ?? ''
    if (parentPath) {
      const actual = deptPath(parentId, lookup.names, lookup.parents)
      if (actual !== parentPath) {
        return { ok: false, message: `路径上级与「${draft.parentLabel}」不一致` }
      }
    }
    return { ok: true, parentId }
  }

  if (parentPath) {
    const viaPath = lookup.byPath.get(parentPath)
    if (viaPath && lookup.names.get(viaPath) === draft.parentLabel) {
      return { ok: true, parentId: viaPath }
    }
    if (viaPath) {
      return { ok: false, message: `路径上级与「${draft.parentLabel}」不一致` }
    }
  }

  if (!ids.length) return { ok: false, message: `没有上级部门「${draft.parentLabel}」` }
  return { ok: false, message: `上级「${draft.parentLabel}」不唯一，请填写路径` }
}

export function resolveDeptDraft(
  draft: DeptCsvDraft,
  lookup: DeptNameLookup,
): FormValidation {
  const parent = resolveDeptParent(draft, lookup)
  if (!parent.ok) return parent
  if (siblingTaken(lookup, draft.name, parent.parentId)) {
    return { message: '同级部门名称已存在', ok: false }
  }
  return {
    ok: true,
    value: {
      name: draft.name,
      parentId: parent.parentId,
      remark: draft.remark,
      status: draft.status,
    },
  }
}

function parentLabelOf(value: string): string {
  return !value || value === '无' ? '' : value
}

function rowToDraft(cells: string[], line: number): { ok: true; draft: DeptCsvDraft } | CsvRejected {
  const name = csvCell(cells, 0)
  const parentLabel = parentLabelOf(csvCell(cells, 1))
  const path = csvCell(cells, 2)
  const status = parseStatusLabel(csvCell(cells, 4))
  const remark = csvCell(cells, 5)
  if (status === null) {
    return { line, message: '状态只能是启用或禁用' }
  }
  if (!name) {
    return { line, message: '请输入部门名称' }
  }
  if (name.length > 32) {
    return { line, message: '部门名称最多 32 个字' }
  }
  return { ok: true, draft: { line, name, parentLabel, path, remark, status } }
}

export function parseDeptCsv(text: string): {
  drafts: DeptCsvDraft[]
  rejected: CsvRejected[]
} {
  const { body, rejected } = readCsvBody(text, DEPT_CSV_HEADER, DEPT_CSV_MAX_ROWS)
  const drafts: DeptCsvDraft[] = []
  for (const [index, cells] of body.entries()) {
    const parsed = rowToDraft(cells ?? [], index + 2)
    if ('ok' in parsed) drafts.push(parsed.draft)
    else rejected.push(parsed)
  }
  return { drafts, rejected }
}

export function applyDeptDrafts(
  drafts: readonly DeptCsvDraft[],
  lookup: DeptNameLookup,
): { accepted: { line: number; value: DeptFormValues }[]; rejected: CsvRejected[] } {
  const accepted: { line: number; value: DeptFormValues }[] = []
  const rejected: CsvRejected[] = []
  for (const draft of orderDeptDraftsForImport(drafts)) {
    const resolved = resolveDeptDraft(draft, lookup)
    if (!resolved.ok) {
      rejected.push({ line: draft.line, message: resolved.message })
      continue
    }
    accepted.push({ line: draft.line, value: resolved.value })
    addDeptToLookup(lookup, {
      id: `import-${draft.line}`,
      name: resolved.value.name,
      parentId: resolved.value.parentId,
    })
  }
  return { accepted, rejected }
}
