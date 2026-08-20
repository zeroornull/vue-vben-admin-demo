import { get, post } from '@/api/request'
import type { AuditImportItem, AuditListQuery, AuditListResult } from '@/views/audit/query'

export function getAuditList(params: AuditListQuery) {
  return get<AuditListResult>('/system/audit/list', { params })
}

export function importAudit(items: AuditImportItem[], config?: { skipErrorToast?: boolean; skipLoadingBar?: boolean }) {
  return post<{ created: number; skipped: number }>('/system/audit/import', { items }, config)
}
