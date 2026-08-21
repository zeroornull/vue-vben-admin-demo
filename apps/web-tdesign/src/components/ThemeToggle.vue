<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { useTheme } from '@/preferences/use-theme'

const { t } = useI18n()
const { cycleTheme, themeMode } = useTheme()
const themeLabel = computed(() => t(`theme.${themeMode.value}`))
</script>

<template>
  <button class="theme-toggle" type="button" :title="`${t('theme.prefix')}：${themeLabel}`" @click="cycleTheme">
    {{ themeLabel }}
  </button>
</template>

<style scoped>
.theme-toggle {
  border: 1px solid var(--color-border);
  border-radius: 0.4rem;
  background: var(--color-background);
  color: var(--color-text);
  padding: 0.3rem 0.65rem;
  font: inherit;
  cursor: pointer;
}
</style>
