import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import {
  USER_COLUMN_ORDER,
  normalizeUserColumns,
  toggleUserColumn,
} from '@/views/users/columns'

export const useTableColumnsStore = defineStore(
  'table-columns',
  () => {
    const users = ref<string[]>([...USER_COLUMN_ORDER])
    const userColumns = computed(() => normalizeUserColumns(users.value))

    function toggleUser(key: string) {
      users.value = toggleUserColumn(users.value, key)
    }

    function resetUsers() {
      users.value = [...USER_COLUMN_ORDER]
    }

    return {
      resetUsers,
      toggleUser,
      userColumns,
      users,
    }
  },
  {
    persist: {
      pick: ['users'],
    },
  },
)
