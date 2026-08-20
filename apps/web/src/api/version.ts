import { get, post } from './request'

export type VersionInfo = {
  buildId: string
}

export function getVersion() {
  return get<VersionInfo>('/version', {
    skipErrorToast: true,
    skipLoadingBar: true,
    skipRetry: true,
  })
}

export function bumpVersion() {
  return post<VersionInfo>('/version/bump', undefined, { skipErrorToast: true })
}
