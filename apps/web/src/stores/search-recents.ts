import { ref } from 'vue'
import { defineStore } from 'pinia'

import type { AccessMenuItem } from '@/router/access-menu'
import {
  normalizeSearchRecents,
  rememberSearchRecent,
  visibleSearchRecents,
  type SearchRecentMap,
} from '@/search/recents'

export const useSearchRecentsStore = defineStore(
  'search-recents',
  () => {
    const byUser = ref<SearchRecentMap>({})

    function remember(username: string, item: AccessMenuItem) {
      byUser.value = rememberSearchRecent(normalizeSearchRecents(byUser.value), username, item)
    }

    function listFor(username: string, allowed: readonly AccessMenuItem[]) {
      const owner = username.trim()
      return visibleSearchRecents(normalizeSearchRecents(byUser.value)[owner], allowed)
    }

    function clear(username: string) {
      const owner = username.trim()
      if (!owner) return
      const next = { ...normalizeSearchRecents(byUser.value) }
      delete next[owner]
      byUser.value = next
    }

    return { byUser, clear, listFor, remember }
  },
  {
    persist: {
      pick: ['byUser'],
    },
  },
)
