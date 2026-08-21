<script setup lang="ts">
import { computed } from 'vue'
import { darkTheme, dateEnUS, dateZhCN, enUS, NConfigProvider, zhCN } from 'naive-ui'
import { storeToRefs } from 'pinia'

import { normalizeLocale } from '@app/core'

import { useTheme } from '@/preferences/use-theme'
import { usePreferencesStore } from '@/stores/preferences'

const { resolved } = useTheme()
const { locale } = storeToRefs(usePreferencesStore())
const naiveLocale = computed(() => (normalizeLocale(locale.value) === 'en-US' ? enUS : zhCN))
const naiveDateLocale = computed(() => (normalizeLocale(locale.value) === 'en-US' ? dateEnUS : dateZhCN))
const theme = computed(() => (resolved.value === 'dark' ? darkTheme : null))
</script>

<template>
  <NConfigProvider :date-locale="naiveDateLocale" :locale="naiveLocale" :theme="theme">
    <div class="naive-page">
      <slot />
    </div>
  </NConfigProvider>
</template>

<style scoped>
.naive-page {
  display: grid;
  gap: var(--page-gap);
}
</style>
