import type { AxiosRequestConfig } from 'axios'

import { del, get, post, put } from '@/api/request'
import type { BatchDeleteResult } from '@/tables/batch'
import type { RoleFormValues, RoleListQuery, RoleListResult, SystemRole } from '@/views/roles/types'

export function getRoleList(params: RoleListQuery) {
  return get<RoleListResult>('/system/role/list', { params })
}

export function createRole(data: RoleFormValues, config?: AxiosRequestConfig) {
  return post<SystemRole>('/system/role', data, config)
}

export function updateRole(id: string, data: RoleFormValues) {
  return put<SystemRole>(`/system/role/${id}`, data)
}

export function deleteRole(id: string) {
  return del<null>(`/system/role/${id}`)
}

export function deleteRoles(ids: string[]) {
  return post<BatchDeleteResult>('/system/role/batch-delete', { ids })
}
