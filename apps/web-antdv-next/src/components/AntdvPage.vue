<script setup lang="ts">
import 'antdv-next/dist/reset.css'
import { computed } from 'vue'
import { ConfigProvider, theme } from 'antdv-next'
import enUS from 'antdv-next/locale/en_US'
import zhCN from 'antdv-next/locale/zh_CN'
import { storeToRefs } from 'pinia'

import { getSkin, normalizeDensity, normalizeLocale } from '@app/core'

import { antdvControlSize } from '@/adapter/antdv'
import { useTheme } from '@/preferences/use-theme'
import { usePreferencesStore } from '@/stores/preferences'

const { resolved } = useTheme()
const { density, locale } = storeToRefs(usePreferencesStore())
const antdvLocale = computed(() => (normalizeLocale(locale.value) === 'en-US' ? enUS : zhCN))
const algorithm = computed(() =>
  resolved.value === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
)
const componentSize = computed(() => {
  const densityValue = normalizeDensity(density.value)
  const size = getSkin()?.controlSize(densityValue) ?? antdvControlSize(densityValue)
  return size === 'small' ? 'small' : 'middle'
})
</script>

<template>
  <ConfigProvider :component-size="componentSize" :locale="antdvLocale" :theme="{ algorithm }">
    <div class="antdv-page">
      <slot />
    </div>
  </ConfigProvider>
</template>

<style scoped>
.antdv-page {
  display: grid;
  gap: var(--page-gap);
}
</style>
