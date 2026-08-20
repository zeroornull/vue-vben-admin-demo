import { del, get, post, put } from '@/api/request'
import type { DeptFormValues, DeptListQuery, SystemDept } from '@/views/depts/types'

export function getDeptList(params: DeptListQuery) {
  return get<SystemDept[]>('/system/dept/list', { params })
}

export function createDept(data: DeptFormValues) {
  return post<SystemDept>('/system/dept', data)
}

export function updateDept(id: string, data: DeptFormValues) {
  return put<SystemDept>(`/system/dept/${id}`, data)
}

export function deleteDept(id: string) {
  return del<null>(`/system/dept/${id}`)
}
