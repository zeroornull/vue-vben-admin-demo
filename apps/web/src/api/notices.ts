import type { NoticeInbox } from '@/notices/query'

import { get, post } from './request'

const quiet = { skipErrorToast: true, skipLoadingBar: true, skipRetry: true }

export function getNotices() {
  return get<NoticeInbox>('/notices', quiet)
}

export function markNoticeReadApi(id?: string) {
  return post<NoticeInbox>('/notices/read', id ? { id } : {}, quiet)
}
