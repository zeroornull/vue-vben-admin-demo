export const OFFLINE_BANNER_TEXT = '网络已断开。已发出的请求可能失败，连上后再点一次刷新。'

export function readNavigatorOnline(source: { onLine?: boolean } | undefined): boolean {
  return source?.onLine !== false
}

export function shouldShowOfflineBanner(online: boolean): boolean {
  return !online
}
