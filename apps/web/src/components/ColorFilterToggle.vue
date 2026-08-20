<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import { colorFilterLabels, nextColorFilter, normalizeColorFilter } from '@/preferences/color-filter'
import { usePreferencesStore } from '@/stores/preferences'

const preferences = usePreferencesStore()
const { colorFilter } = storeToRefs(preferences)
const label = computed(() => colorFilterLabels[normalizeColorFilter(colorFilter.value)])

function cycle() {
  preferences.setColorFilter(nextColorFilter(normalizeColorFilter(colorFilter.value)))
}
</script>

<template>
  <button
    class="color-filter-toggle"
    type="button"
    :title="`色彩：${label}`"
    @click="cycle"
  >
    {{ label }}
  </button>
</template>

<style scoped>
.color-filter-toggle {
  border: 1px solid var(--color-border);
  border-radius: 0.4rem;
  background: var(--color-background);
  color: var(--color-text);
  padding: 0.3rem 0.65rem;
  font: inherit;
  cursor: pointer;
}
</style>
