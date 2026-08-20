import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import {
  emptyTableExpandState,
  mergeExpandedKeys,
  normalizeExpandKeys,
  normalizeTableExpandState,
  type TableExpandKey,
} from '@/tables/expand'

export const useTableExpandStore = defineStore(
  'table-expand',
  () => {
    const expanded = ref(emptyTableExpandState())
    const normalized = computed(() => normalizeTableExpandState(expanded.value))

    function keysOf(key: TableExpandKey, validIds: readonly string[]): string[] {
      return normalizeExpandKeys(normalized.value[key], validIds)
    }

    function setKeys(key: TableExpandKey, incoming: readonly unknown[], visibleIds: readonly string[], allIds: readonly string[]) {
      expanded.value = {
        ...normalized.value,
        [key]: mergeExpandedKeys(incoming, visibleIds, normalized.value[key], allIds),
      }
    }

    return {
      expanded,
      keysOf,
      setKeys,
    }
  },
  {
    persist: {
      pick: ['expanded'],
    },
  },
)
