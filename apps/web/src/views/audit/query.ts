import { parseSortParams, sortListByQuery, TABLE_SORT_FIELDS } from '../../tables/sort'

export const AUDIT_MAX = 100
export const AUDIT_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export const auditActions = ['create', 'update', 'delete'] as const
export const auditTargets = ['user', 'dept', 'role', 'profile', 'link'] as const

export type AuditAction = (typeof auditActions)[number]
export type AuditTarget = (typeof auditTargets)[number]

export type AuditEntry = {
  action: AuditAction
  actor: string
  at: string
  id: string
  summary: string
  target: AuditTarget
}

export type AuditListQuery = {
  actor: string
  from?: string
  page: number
  pageSize: number
  sortField?: string
  sortOrder?: string
  target: AuditTarget | ''
  to?: string
}

export type AuditListResult = {
  items: AuditEntry[]
  total: number
}

export const auditActionLabels: Record<AuditAction, string> = {
  create: '新建',
  delete: '删除',
  update: '修改',
}

export const auditTargetLabels: Record<AuditTarget, string> = {
  dept: '部门',
  link: '外链',
  profile: '资料',
  role: '角色',
  user: '用户',
}

export function isAuditAction(value: unknown): value is AuditAction {
  return value === 'create' || value === 'update' || value === 'delete'
}

export function isAuditTarget(value: unknown): value is AuditTarget {
  return (
    value === 'user' ||
    value === 'dept' ||
    value === 'role' ||
    value === 'profile' ||
    value === 'link'
  )
}

export function auditSummary(action: AuditAction, target: AuditTarget, name: string): string {
  const label = name.trim() || '未命名'
  return `${auditActionLabels[action]}${auditTargetLabels[target]}「${label}」`
}

export function normalizeAuditDate(value: unknown): string {
  const text = String(value ?? '').trim()
  return AUDIT_DATE_PATTERN.test(text) ? text : ''
}

export function auditRangeBounds(from: string, to: string): { from: string; to: string } {
  const start = normalizeAuditDate(from)
  const end = normalizeAuditDate(to)
  if (start && end && start > end) return { from: end, to: start }
  return { from: start, to: end }
}

export function matchesAuditAt(at: string, from: string, to: string): boolean {
  const bounds = auditRangeBounds(from, to)
  const day = at.slice(0, 10)
  if (!AUDIT_DATE_PATTERN.test(day)) return !bounds.from && !bounds.to
  if (bounds.from && day < bounds.from) return false
  if (bounds.to && day > bounds.to) return false
  return true
}

export function parseAuditListQuery(search: URLSearchParams): AuditListQuery {
  const page = Math.max(1, Number.parseInt(search.get('page') ?? '1', 10) || 1)
  const pageSize = Math.min(
    100,
    Math.max(1, Number.parseInt(search.get('pageSize') ?? '10', 10) || 10),
  )
  const actor = (search.get('actor') ?? '').trim()
  const targetRaw = search.get('target') ?? ''
  const target = isAuditTarget(targetRaw) ? targetRaw : ''
  return {
    actor,
    from: normalizeAuditDate(search.get('from')),
    page,
    pageSize,
    target,
    to: normalizeAuditDate(search.get('to')),
    ...parseSortParams(search, TABLE_SORT_FIELDS.audit),
  }
}

export function queryAudit(items: AuditEntry[], query: AuditListQuery): AuditListResult {
  const actor = query.actor.toLowerCase()
  const filtered = items.filter((item) => {
    if (actor && !item.actor.toLowerCase().includes(actor)) return false
    if (query.target && item.target !== query.target) return false
    if (!matchesAuditAt(item.at, query.from ?? '', query.to ?? '')) return false
    return true
  })
  const sorted = sortListByQuery(filtered, query, TABLE_SORT_FIELDS.audit)
  const start = (query.page - 1) * query.pageSize
  return {
    items: sorted.slice(start, start + query.pageSize),
    total: sorted.length,
  }
}

export function prependAudit(
  items: AuditEntry[],
  entry: Omit<AuditEntry, 'id'>,
  id: string,
  max = AUDIT_MAX,
): AuditEntry[] {
  return [{ ...entry, id }, ...items].slice(0, max)
}
