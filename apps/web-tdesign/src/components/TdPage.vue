<script setup lang="ts">
import 'tdesign-vue-next/es/style/index.css'
import { computed } from 'vue'
import { ConfigProvider, type GlobalConfigProvider } from 'tdesign-vue-next'
import enConfig from 'tdesign-vue-next/es/locale/en_US'
import zhConfig from 'tdesign-vue-next/es/locale/zh_CN'
import { storeToRefs } from 'pinia'

import { normalizeLocale } from '@app/core'

import { usePreferencesStore } from '@/stores/preferences'

const { locale } = storeToRefs(usePreferencesStore())
const tdLocale = computed<GlobalConfigProvider>(() =>
  normalizeLocale(locale.value) === 'en-US'
    ? (enConfig as unknown as GlobalConfigProvider)
    : (zhConfig as unknown as GlobalConfigProvider),
)
</script>

<template>
  <ConfigProvider :global-config="tdLocale">
    <div class="td-page">
      <slot />
    </div>
  </ConfigProvider>
</template>

<style scoped>
.td-page {
  display: grid;
  gap: var(--page-gap);
}
</style>
