<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'

import { nextLocale, normalizeLocale } from '@app/core'
import { usePreferencesStore } from '@/stores/preferences'

const { t } = useI18n()
const preferences = usePreferencesStore()
const { locale } = storeToRefs(preferences)
const current = computed(() => normalizeLocale(locale.value))
const label = computed(() => t(`locale.${current.value}`))

function cycle() {
  preferences.setLocale(nextLocale(current.value))
}
</script>

<template>
  <button class="locale-toggle" type="button" :title="t('locale.title')" @click="cycle">
    {{ label }}
  </button>
</template>

<style scoped>
.locale-toggle {
  border: 1px solid var(--color-border);
  border-radius: 0.4rem;
  background: var(--color-background);
  color: var(--color-text);
  padding: 0.3rem 0.65rem;
  font: inherit;
  cursor: pointer;
}
</style>
