import type { UserInfo } from '@/types/user'

import { get } from './request'

export function getUserInfoApi() {
  return get<UserInfo>('/user/info')
}
