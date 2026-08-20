import { get } from '@/api/request'
import type { AuditListQuery, AuditListResult } from '@/views/audit/query'

export function getAuditList(params: AuditListQuery) {
  return get<AuditListResult>('/system/audit/list', { params })
}
