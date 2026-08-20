<script setup lang="ts">
import { watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'

import AppBackTop from '@/components/AppBackTop.vue'
import AppLoadingBar from '@/components/AppLoadingBar.vue'
import AppToast from '@/components/AppToast.vue'
import AppUpdateBar from '@/components/AppUpdateBar.vue'
import AppWatermark from '@/components/AppWatermark.vue'
import { applyColorFilterDataset, normalizeColorFilter } from '@/preferences/color-filter'
import { applyDensityDataset, normalizeDensity } from '@/preferences/density'
import { applyThemeDataset } from '@/preferences/theme'
import { useTheme } from '@/preferences/use-theme'
import { applyDocumentTitle, documentTitle, readRouteTitle } from '@/router/document-title'
import { usePreferencesStore } from '@/stores/preferences'

const route = useRoute()
const { themeMode } = useTheme()
const preferences = usePreferencesStore()

watch(
  themeMode,
  (mode) => {
    applyThemeDataset(document.documentElement, mode)
  },
  { immediate: true },
)

watch(
  () => preferences.colorFilter,
  (filter) => {
    applyColorFilterDataset(document.documentElement, normalizeColorFilter(filter))
  },
  { immediate: true },
)

watch(
  () => preferences.density,
  (density) => {
    applyDensityDataset(document.documentElement, normalizeDensity(density))
  },
  { immediate: true },
)

watch(
  () => [readRouteTitle(route.meta), preferences.appName] as const,
  ([page, appName]) => {
    applyDocumentTitle(document, documentTitle(page, appName))
  },
  { immediate: true },
)
</script>

<template>
  <AppLoadingBar />
  <AppUpdateBar />
  <AppToast />
  <AppWatermark />
  <AppBackTop />
  <RouterView />
</template>
