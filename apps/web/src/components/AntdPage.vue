<script setup lang="ts">
import 'ant-design-vue/dist/reset.css'
import { computed } from 'vue'
import { ConfigProvider, theme } from 'ant-design-vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'

import { storeToRefs } from 'pinia'

import { antdComponentSize, normalizeDensity } from '@/preferences/density'
import { useTheme } from '@/preferences/use-theme'
import { usePreferencesStore } from '@/stores/preferences'

const { resolved } = useTheme()
const { density } = storeToRefs(usePreferencesStore())
const algorithm = computed(() =>
  resolved.value === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
)
const componentSize = computed(() => antdComponentSize(normalizeDensity(density.value)))
</script>

<template>
  <ConfigProvider :component-size="componentSize" :locale="zhCN" :theme="{ algorithm }">
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
