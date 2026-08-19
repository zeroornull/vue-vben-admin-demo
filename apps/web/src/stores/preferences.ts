import { ref } from 'vue'
import { defineStore } from 'pinia'

export const usePreferencesStore = defineStore(
  'preferences',
  () => {
    const appName = ref('Vue Admin')
    const sidebarCollapsed = ref(false)

    function toggleSidebar() {
      sidebarCollapsed.value = !sidebarCollapsed.value
    }

    return {
      appName,
      sidebarCollapsed,
      toggleSidebar,
    }
  },
  {
    persist: {
      pick: ['sidebarCollapsed'],
    },
  },
)
