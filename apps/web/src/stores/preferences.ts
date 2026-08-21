import { ref } from 'vue'
import { defineStore } from 'pinia'

import {
  normalizeColorFilter,
  normalizeDensity,
  normalizeLocale,
  normalizeThemeMode,
  type AppLocale,
  type ColorFilter,
  type Density,
  type ThemeMode,
} from '@app/core'
import { normalizeIdleLockMinutes, type IdleLockMinutes } from '@/preferences/idle-lock'
import { normalizeNavLayout, type NavLayout } from '@/preferences/nav-layout'
import { normalizeSidebarWidth, SIDEBAR_WIDTH_DEFAULT } from '@/preferences/sidebar-width'

export const usePreferencesStore = defineStore(
  'preferences',
  () => {
    const appName = ref('Vue Admin')
    const sidebarCollapsed = ref(false)
    const sidebarWidth = ref(SIDEBAR_WIDTH_DEFAULT)
    const themeMode = ref<ThemeMode>('system')
    const watermarkEnabled = ref(true)
    const colorFilter = ref<ColorFilter>('none')
    const density = ref<Density>('comfortable')
    const navLayout = ref<NavLayout>('sidebar')
    const idleLockMinutes = ref<IdleLockMinutes>(0)
    const locale = ref<AppLocale>('zh-CN')

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

    function setNavLayout(value: NavLayout) {
      navLayout.value = normalizeNavLayout(value)
    }

    function setIdleLockMinutes(value: IdleLockMinutes) {
      idleLockMinutes.value = normalizeIdleLockMinutes(value)
    }

    function setLocale(value: unknown) {
      locale.value = normalizeLocale(value)
    }

    function setSidebarWidth(value: unknown) {
      sidebarWidth.value = normalizeSidebarWidth(value)
    }

    function resetSidebarWidth() {
      sidebarWidth.value = SIDEBAR_WIDTH_DEFAULT
    }

    return {
      appName,
      colorFilter,
      density,
      idleLockMinutes,
      locale,
      navLayout,
      setColorFilter,
      setDensity,
      setIdleLockMinutes,
      setLocale,
      resetSidebarWidth,
      setNavLayout,
      setSidebarWidth,
      setThemeMode,
      sidebarCollapsed,
      sidebarWidth,
      themeMode,
      toggleSidebar,
      toggleWatermark,
      watermarkEnabled,
    }
  },
  {
    persist: {
      pick: [
        'colorFilter',
        'density',
        'idleLockMinutes',
        'locale',
        'navLayout',
        'sidebarCollapsed',
        'sidebarWidth',
        'themeMode',
        'watermarkEnabled',
      ],
    },
  },
)
