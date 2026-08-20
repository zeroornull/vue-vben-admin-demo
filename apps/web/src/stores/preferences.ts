import { ref } from 'vue'
import { defineStore } from 'pinia'

import { normalizeColorFilter, type ColorFilter } from '@/preferences/color-filter'
import { normalizeDensity, type Density } from '@/preferences/density'
import { normalizeThemeMode, type ThemeMode } from '@/preferences/theme'

export const usePreferencesStore = defineStore(
  'preferences',
  () => {
    const appName = ref('Vue Admin')
    const sidebarCollapsed = ref(false)
    const themeMode = ref<ThemeMode>('system')
    const watermarkEnabled = ref(true)
    const colorFilter = ref<ColorFilter>('none')
    const density = ref<Density>('comfortable')

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

    function setDensity(value: Density) {
      density.value = normalizeDensity(value)
    }

    return {
      appName,
      colorFilter,
      density,
      setColorFilter,
      setDensity,
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
      pick: ['colorFilter', 'density', 'sidebarCollapsed', 'themeMode', 'watermarkEnabled'],
    },
  },
)
