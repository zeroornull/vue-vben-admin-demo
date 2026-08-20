import type { RouteMeta } from 'vue-router'
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import {
  cachedViewNames,
  closeOtherTabs,
  closeTab,
  ensureHome,
  HOME_TAB,
  nextPathAfterClose,
  pruneTabs,
  tabFromRoute,
  upsertTab,
  type AppTab,
} from '@/layouts/tab-query'

export const useTabsStore = defineStore(
  'tabs',
  () => {
    const tabs = ref<AppTab[]>([HOME_TAB])
    const owner = ref('')

    const cachedNames = computed(() => cachedViewNames(tabs.value))

    function syncOwner(username: string) {
      if (!username) return
      if (owner.value && owner.value !== username) {
        tabs.value = [HOME_TAB]
      }
      owner.value = username
    }

    function openFromRoute(route: { fullPath: string; meta: RouteMeta; name: unknown }) {
      if (typeof route.name !== 'string') return
      const tab = tabFromRoute({
        fullPath: route.fullPath,
        meta: route.meta,
        name: route.name,
      })
      if (!tab) return
      tabs.value = upsertTab(ensureHome(tabs.value), tab)
    }

    function prune(allowedNames: string[]) {
      tabs.value = ensureHome(pruneTabs(tabs.value, allowedNames))
    }

    function close(name: string, currentName: string) {
      const path = nextPathAfterClose(tabs.value, name, currentName)
      tabs.value = ensureHome(closeTab(tabs.value, name))
      return path
    }

    function closeOthers(keepName: string) {
      tabs.value = ensureHome(closeOtherTabs(tabs.value, keepName))
    }

    function reset() {
      tabs.value = [HOME_TAB]
      owner.value = ''
    }

    return {
      cachedNames,
      close,
      closeOthers,
      openFromRoute,
      owner,
      prune,
      reset,
      syncOwner,
      tabs,
    }
  },
  {
    persist: {
      pick: ['owner', 'tabs'],
    },
  },
)
