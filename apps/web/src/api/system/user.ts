import { del, get, post, put } from '@/api/request'
import type { SystemUser, UserFormValues, UserListQuery, UserListResult } from '@/views/users/types'

export function getUserList(params: UserListQuery) {
  return get<UserListResult>('/system/user/list', { params })
}

export function createUser(data: UserFormValues) {
  return post<SystemUser>('/system/user', data)
}

export function updateUser(id: string, data: UserFormValues) {
  return put<SystemUser>(`/system/user/${id}`, data)
}

export function deleteUser(id: string) {
  return del<null>(`/system/user/${id}`)
}
