import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import {
  TABLE_COLUMN_SPECS,
  emptyTableColumns,
  isColumnVisible,
  normalizeColumns,
  resolvePersistedColumns,
  toggleColumn,
  type TableColumnKey,
  type TableColumns,
} from '@/tables/columns'

export const useTableColumnsStore = defineStore(
  'table-columns',
  () => {
    const columns = ref<TableColumns>(emptyTableColumns())
    const users = ref<string[]>(emptyTableColumns().users)
    const normalized = computed(() => resolvePersistedColumns(columns.value, users.value))

    function columnsOf(key: TableColumnKey): string[] {
      return normalized.value[key]
    }

    function isVisible(key: TableColumnKey, column: string): boolean {
      return isColumnVisible(columnsOf(key), column, TABLE_COLUMN_SPECS[key])
    }

    function write(next: TableColumns) {
      columns.value = next
      users.value = next.users
    }

    function toggle(key: TableColumnKey, column: string) {
      write({
        ...normalized.value,
        [key]: toggleColumn(normalized.value[key], column, TABLE_COLUMN_SPECS[key]),
      })
    }

    function reset(key: TableColumnKey) {
      write({
        ...normalized.value,
        [key]: normalizeColumns(undefined, TABLE_COLUMN_SPECS[key]),
      })
    }

    const userColumns = computed(() => columnsOf('users'))

    function toggleUser(column: string) {
      toggle('users', column)
    }

    function resetUsers() {
      reset('users')
    }

    return {
      columns,
      columnsOf,
      isVisible,
      reset,
      resetUsers,
      toggle,
      toggleUser,
      userColumns,
      users,
    }
  },
  {
    persist: {
      pick: ['columns', 'users'],
    },
  },
)
