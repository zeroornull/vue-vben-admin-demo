import type { UserInfo } from '@/types/user'

import { get, put } from './request'

export function getUserInfoApi() {
  return get<UserInfo>('/user/info')
}

export function updateProfileApi(data: { realName: string }) {
  return put<UserInfo>('/user/profile', data)
}
