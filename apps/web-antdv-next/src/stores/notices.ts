import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { getNotices, markNoticeReadApi } from '@/api/notices'
import {
  markAllNoticesRead,
  markNoticeRead,
  noticeBadge,
  unreadCount,
  type Notice,
} from '@/notices/query'

export const useNoticesStore = defineStore('notices', () => {
  const items = ref<Notice[]>([])
  const readIds = ref<string[]>([])

  const unread = computed(() => unreadCount(items.value, readIds.value))
  const badge = computed(() => noticeBadge(unread.value))

  function applyInbox(inbox: { items: Notice[]; readIds: string[] }) {
    items.value = inbox.items
    readIds.value = inbox.readIds
  }

  async function pull() {
    try {
      applyInbox(await getNotices())
    } catch {
      items.value = []
      readIds.value = []
    }
  }

  async function readOne(id: string) {
    readIds.value = markNoticeRead(readIds.value, id)
    try {
      applyInbox(await markNoticeReadApi(id))
    } catch {
      /* 乐观已读，失败就保持本地 */
    }
  }

  async function readAll() {
    readIds.value = markAllNoticesRead(readIds.value, items.value)
    try {
      applyInbox(await markNoticeReadApi())
    } catch {
      /* 同上 */
    }
  }

  function reset() {
    items.value = []
    readIds.value = []
  }

  return {
    badge,
    items,
    pull,
    readAll,
    readIds,
    readOne,
    reset,
    unread,
  }
})
