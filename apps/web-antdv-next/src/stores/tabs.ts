import type { RouteMeta } from 'vue-router'
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import {
  cachedViewNames,
  closeAllTabs,
  closeLeftTabs,
  closeOtherTabs,
  closeRightTabs,
  closeTab,
  ensureHome,
  HOME_TAB,
  nextPathAfterClose,
  nextPathIfMissing,
  pruneTabs,
  reorderTabs,
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

    function closeOthers(keepName: string, currentName: string) {
      const next = ensureHome(closeOtherTabs(tabs.value, keepName))
      const path = nextPathIfMissing(next, currentName, keepName)
      tabs.value = next
      return path
    }

    function closeLeft(name: string, currentName: string) {
      const next = ensureHome(closeLeftTabs(tabs.value, name))
      const path = nextPathIfMissing(next, currentName, name)
      tabs.value = next
      return path
    }

    function closeRight(name: string, currentName: string) {
      const next = ensureHome(closeRightTabs(tabs.value, name))
      const path = nextPathIfMissing(next, currentName, name)
      tabs.value = next
      return path
    }

    function closeAll(currentName: string) {
      const next = ensureHome(closeAllTabs(tabs.value))
      const path = nextPathIfMissing(next, currentName)
      tabs.value = next
      return path
    }

    function reorder(fromName: string, toName: string) {
      tabs.value = ensureHome(reorderTabs(tabs.value, fromName, toName))
    }

    function reset() {
      tabs.value = [HOME_TAB]
      owner.value = ''
    }

    return {
      cachedNames,
      close,
      closeAll,
      closeLeft,
      closeOthers,
      closeRight,
      openFromRoute,
      owner,
      prune,
      reorder,
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
