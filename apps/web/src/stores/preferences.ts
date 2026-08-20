import { ref } from 'vue'
import { defineStore } from 'pinia'

import { normalizeColorFilter, type ColorFilter } from '@/preferences/color-filter'
import { normalizeThemeMode, type ThemeMode } from '@/preferences/theme'

export const usePreferencesStore = defineStore(
  'preferences',
  () => {
    const appName = ref('Vue Admin')
    const sidebarCollapsed = ref(false)
    const themeMode = ref<ThemeMode>('system')
    const watermarkEnabled = ref(true)
    const colorFilter = ref<ColorFilter>('none')

    function toggleSidebar() {
      sidebarCollapsed.value = !sidebarCollapsed.value
    }

    function toggleWatermark() {
      watermarkEnabled.value = !watermarkEnabled.value
    }

    function setThemeMode(mode: ThemeMode) {
      themeMode.value = normalizeThemeMode(mode)
    }

    function setColorFilter(filter: ColorFilter) {
      colorFilter.value = normalizeColorFilter(filter)
    }

    return {
      appName,
      colorFilter,
      setColorFilter,
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
      pick: ['colorFilter', 'sidebarCollapsed', 'themeMode', 'watermarkEnabled'],
    },
  },
)
