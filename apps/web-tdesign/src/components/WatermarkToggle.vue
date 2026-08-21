<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import { usePreferencesStore } from '@/stores/preferences'

const preferences = usePreferencesStore()
const { watermarkEnabled } = storeToRefs(preferences)
const label = computed(() => (watermarkEnabled.value ? '水印开' : '水印关'))
</script>

<template>
  <button
    class="watermark-toggle"
    type="button"
    :title="watermarkEnabled ? '关闭页面水印' : '打开页面水印'"
    @click="preferences.toggleWatermark()"
  >
    {{ label }}
  </button>
</template>

<style scoped>
.watermark-toggle {
  border: 1px solid var(--color-border);
  border-radius: 0.4rem;
  background: var(--color-background);
  color: var(--color-text);
  padding: 0.3rem 0.65rem;
  font: inherit;
  cursor: pointer;
}
</style>
