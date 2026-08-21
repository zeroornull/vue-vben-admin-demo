import type { AxiosRequestConfig } from 'axios'

import { del, get, post, put } from '@/api/request'
import type { SystemUser, UserFormValues, UserListQuery, UserListResult } from '@/views/users/types'

export function getUserList(params: UserListQuery) {
  return get<UserListResult>('/system/user/list', { params })
}

export function createUser(data: UserFormValues, config?: AxiosRequestConfig) {
  return post<SystemUser>('/system/user', data, config)
}

export function updateUser(id: string, data: UserFormValues) {
  return put<SystemUser>(`/system/user/${id}`, data)
}

export function deleteUser(id: string) {
  return del<null>(`/system/user/${id}`)
}

export function deleteUsers(ids: string[]) {
  return post<{ deleted: number }>('/system/user/batch-delete', { ids })
}
