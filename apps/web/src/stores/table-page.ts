import { ref } from 'vue'
import { defineStore } from 'pinia'

import {
  emptyTablePageSizes,
  normalizeTablePageSize,
  normalizeTablePageSizes,
  type TablePageKey,
} from '@/tables/page-size'

export const useTablePageStore = defineStore(
  'table-page',
  () => {
    const sizes = ref(emptyTablePageSizes())

    function pageSizeOf(key: TablePageKey) {
      return normalizeTablePageSizes(sizes.value)[key]
    }

    function setPageSize(key: TablePageKey, value: unknown) {
      sizes.value = {
        ...normalizeTablePageSizes(sizes.value),
        [key]: normalizeTablePageSize(value),
      }
    }

    return {
      pageSizeOf,
      setPageSize,
      sizes,
    }
  },
  {
    persist: {
      pick: ['sizes'],
    },
  },
)
