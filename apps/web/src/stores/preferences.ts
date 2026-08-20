import { ref } from 'vue'
import { defineStore } from 'pinia'

import { normalizeThemeMode, type ThemeMode } from '@/preferences/theme'

export const usePreferencesStore = defineStore(
  'preferences',
  () => {
    const appName = ref('Vue Admin')
    const sidebarCollapsed = ref(false)
    const themeMode = ref<ThemeMode>('system')
    const watermarkEnabled = ref(true)

    function toggleSidebar() {
      sidebarCollapsed.value = !sidebarCollapsed.value
    }

    function toggleWatermark() {
      watermarkEnabled.value = !watermarkEnabled.value
    }

    function setThemeMode(mode: ThemeMode) {
      themeMode.value = normalizeThemeMode(mode)
    }

    return {
      appName,
      setThemeMode,
      sidebarCollapsed,
      themeMode,
      toggleSidebar,
      toggleWatermark,
      watermarkEnabled,
    }
  },
  {
    persist: {
      pick: ['sidebarCollapsed', 'themeMode', 'watermarkEnabled'],
    },
  },
)
