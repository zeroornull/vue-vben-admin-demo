<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import { usePreferencesStore } from '@/stores/preferences'

import { COPYRIGHT_START_YEAR, copyrightLine } from './copyright'

const { appName } = storeToRefs(usePreferencesStore())

const text = computed(() =>
  copyrightLine(appName.value, COPYRIGHT_START_YEAR, new Date().getFullYear()),
)
</script>

<template>
  <footer class="footer">{{ text }}</footer>
</template>

<style scoped>
.footer {
  border-top: 1px solid var(--color-border);
  padding: var(--chrome-footer-pad);
  font-size: 0.78rem;
  text-align: center;
  opacity: 0.55;
}
</style>
