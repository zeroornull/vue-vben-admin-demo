import { ref } from 'vue'
import { defineStore } from 'pinia'

import {
  emptyTableSorts,
  normalizeTableSort,
  normalizeTableSorts,
  TABLE_SORT_FIELDS,
  type TableSort,
} from '@/tables/sort'
import type { TablePageKey } from '@/tables/page-size'

export const useTableSortStore = defineStore(
  'table-sort',
  () => {
    const sorts = ref(emptyTableSorts())

    function sortOf(key: TablePageKey): TableSort | null {
      return normalizeTableSorts(sorts.value)[key]
    }

    function setSort(key: TablePageKey, value: TableSort | null) {
      const allowed = TABLE_SORT_FIELDS[key]
      sorts.value = {
        ...normalizeTableSorts(sorts.value),
        [key]: value ? normalizeTableSort(value.field, value.order, allowed) : null,
      }
    }

    return { setSort, sortOf, sorts }
  },
  {
    persist: {
      pick: ['sorts'],
    },
  },
)
