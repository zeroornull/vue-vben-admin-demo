<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import { nextDensity, normalizeDensity } from '@app/core'
import { useI18n } from 'vue-i18n'
import { usePreferencesStore } from '@/stores/preferences'

const { t } = useI18n()
const preferences = usePreferencesStore()
const { density } = storeToRefs(preferences)
const label = computed(() => t(`density.${normalizeDensity(density.value)}`))

function cycle() {
  preferences.setDensity(nextDensity(normalizeDensity(density.value)))
}
</script>

<template>
  <button class="density-toggle" type="button" :title="`疏密：${label}`" @click="cycle">
    {{ label }}
  </button>
</template>

<style scoped>
.density-toggle {
  border: 1px solid var(--color-border);
  border-radius: 0.4rem;
  background: var(--color-background);
  color: var(--color-text);
  padding: 0.3rem 0.65rem;
  font: inherit;
  cursor: pointer;
}
</style>
