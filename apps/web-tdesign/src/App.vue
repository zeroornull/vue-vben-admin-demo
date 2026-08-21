<script setup lang="ts">
import { watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'

import { useSessionSync } from '@/auth/use-session-sync'
import AppBackTop from '@/components/AppBackTop.vue'
import AppLoadingBar from '@/components/AppLoadingBar.vue'
import AppOfflineBar from '@/components/AppOfflineBar.vue'
import AppToast from '@/components/AppToast.vue'
import AppUpdateBar from '@/components/AppUpdateBar.vue'
import AppWatermark from '@/components/AppWatermark.vue'
import {
  applyColorFilterDataset,
  applyDensityDataset,
  applyHtmlLang,
  applyThemeDataset,
  normalizeColorFilter,
  normalizeDensity,
  normalizeLocale,
} from '@app/core'
import { useDisplayTitle } from '@/i18n/display'
import { i18n } from '@/i18n'
import { useTheme } from '@/preferences/use-theme'
import { applyDocumentTitle, documentTitle, readRouteTitle } from '@/router/document-title'
import { useLinksStore } from '@/stores/links'
import { usePreferencesStore } from '@/stores/preferences'

const route = useRoute()
useSessionSync()
const { resolved, themeMode } = useTheme()
const preferences = usePreferencesStore()
const linksStore = useLinksStore()
const { routeTitle } = useDisplayTitle()

watch(
  themeMode,
  (mode) => {
    applyThemeDataset(document.documentElement, mode)
  },
  { immediate: true },
)

watch(
  resolved,
  (value) => {
    if (value === 'dark') document.documentElement.setAttribute('theme-mode', 'dark')
    else document.documentElement.removeAttribute('theme-mode')
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
  () => preferences.locale,
  (value) => {
    const locale = normalizeLocale(value)
    if (locale !== value) preferences.setLocale(locale)
    i18n.global.locale.value = locale
    applyHtmlLang(document.documentElement, locale)
  },
  { immediate: true },
)

watch(
  () => {
    const fallback = readRouteTitle(route.meta)
    const name = String(route.name ?? '')
    if (name === 'embed-link') {
      const code = typeof route.params.code === 'string' ? route.params.code : ''
      return [linksStore.titleFor(code) || fallback, preferences.appName] as const
    }
    return [routeTitle(name, fallback), preferences.appName] as const
  },
  ([page, appName]) => {
    applyDocumentTitle(document, documentTitle(page, appName))
  },
  { immediate: true },
)
</script>

<template>
  <AppLoadingBar />
  <AppUpdateBar />
  <AppOfflineBar />
  <AppToast />
  <AppWatermark />
  <AppBackTop />
  <RouterView />
</template>
