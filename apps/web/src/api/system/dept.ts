import type { AxiosRequestConfig } from 'axios'

import { del, get, post, put } from '@/api/request'
import type { BatchDeleteResult } from '@app/tables/batch'
import type { DeptFormValues, DeptListQuery, SystemDept } from '@/views/depts/types'

export function getDeptList(params: DeptListQuery) {
  return get<SystemDept[]>('/system/dept/list', { params })
}

export function createDept(data: DeptFormValues, config?: AxiosRequestConfig) {
  return post<SystemDept>('/system/dept', data, config)
}

export function updateDept(id: string, data: DeptFormValues) {
  return put<SystemDept>(`/system/dept/${id}`, data)
}

export function deleteDept(id: string) {
  return del<null>(`/system/dept/${id}`)
}

export function deleteDepts(ids: string[]) {
  return post<BatchDeleteResult>('/system/dept/batch-delete', { ids })
}
