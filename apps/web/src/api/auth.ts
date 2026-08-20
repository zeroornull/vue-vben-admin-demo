import { post } from './request'

export interface LoginParams {
  password: string
  username: string
}

export interface LoginResult {
  accessToken: string
}

export function loginApi(data: LoginParams) {
  return post<LoginResult>('/auth/login', data, { skipErrorToast: true })
}

export function logoutApi() {
  return post<null>('/auth/logout', undefined, { skipErrorToast: true })
}

export function unlockApi(password: string) {
  return post<null>('/auth/unlock', { password }, { skipErrorToast: true })
}
