<script setup lang="ts">
import { watch } from 'vue'
import { RouterView } from 'vue-router'

import AppLoadingBar from '@/components/AppLoadingBar.vue'
import AppWatermark from '@/components/AppWatermark.vue'
import { applyThemeDataset } from '@/preferences/theme'
import { useTheme } from '@/preferences/use-theme'

const { themeMode } = useTheme()

watch(
  themeMode,
  (mode) => {
    applyThemeDataset(document.documentElement, mode)
  },
  { immediate: true },
)
</script>

<template>
  <AppLoadingBar />
  <AppWatermark />
  <RouterView />
</template>
