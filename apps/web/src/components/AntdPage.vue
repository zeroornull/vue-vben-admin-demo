<script setup lang="ts">
import 'ant-design-vue/dist/reset.css'
import { computed } from 'vue'
import { ConfigProvider, theme } from 'ant-design-vue'
import enUS from 'ant-design-vue/es/locale/en_US'
import zhCN from 'ant-design-vue/es/locale/zh_CN'

import { storeToRefs } from 'pinia'

import { getSkin, normalizeDensity, normalizeLocale } from '@app/core'

import { antdControlSize } from '@/adapter/antd'
import { useTheme } from '@/preferences/use-theme'
import { usePreferencesStore } from '@/stores/preferences'

const { resolved } = useTheme()
const { density, locale } = storeToRefs(usePreferencesStore())
const antdLocale = computed(() => (normalizeLocale(locale.value) === 'en-US' ? enUS : zhCN))
const algorithm = computed(() =>
  resolved.value === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
)
const componentSize = computed(() => {
  const densityValue = normalizeDensity(density.value)
  const size = getSkin()?.controlSize(densityValue) ?? antdControlSize(densityValue)
  return size === 'small' ? 'small' : 'middle'
})
</script>

<template>
  <ConfigProvider :component-size="componentSize" :locale="antdLocale" :theme="{ algorithm }">
    <div class="antd-page">
      <slot />
    </div>
  </ConfigProvider>
</template>

<style scoped>
.antd-page {
  display: grid;
  gap: var(--page-gap);
}
</style>
