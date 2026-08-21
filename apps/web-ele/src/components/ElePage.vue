<script setup lang="ts">
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import { computed } from 'vue'
import { ElConfigProvider } from 'element-plus'
import en from 'element-plus/es/locale/lang/en'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { storeToRefs } from 'pinia'

import { getSkin, normalizeDensity, normalizeLocale } from '@app/core'

import { elementControlSize } from '@/adapter/element'
import { useTheme } from '@/preferences/use-theme'
import { usePreferencesStore } from '@/stores/preferences'

const { resolved } = useTheme()
const { density, locale } = storeToRefs(usePreferencesStore())
const eleLocale = computed(() => (normalizeLocale(locale.value) === 'en-US' ? en : zhCn))
const componentSize = computed(() => {
  const densityValue = normalizeDensity(density.value)
  const size = getSkin()?.controlSize(densityValue) ?? elementControlSize(densityValue)
  return size === 'small' ? 'small' : 'default'
})
</script>

<template>
  <ElConfigProvider :locale="eleLocale" :size="componentSize">
    <div class="ele-page" :data-theme="resolved">
      <slot />
    </div>
  </ElConfigProvider>
</template>

<style scoped>
.ele-page {
  display: grid;
  gap: var(--page-gap);
}
</style>
