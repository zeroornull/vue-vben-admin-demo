<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import {
  idleLockLabels,
  nextIdleLockMinutes,
  normalizeIdleLockMinutes,
} from '@/preferences/idle-lock'
import { usePreferencesStore } from '@/stores/preferences'

const preferences = usePreferencesStore()
const { idleLockMinutes } = storeToRefs(preferences)
const minutes = computed(() => normalizeIdleLockMinutes(idleLockMinutes.value))
const label = computed(() => idleLockLabels[minutes.value])

function cycle() {
  preferences.setIdleLockMinutes(nextIdleLockMinutes(minutes.value))
}
</script>

<template>
  <button class="idle-lock-toggle" type="button" :title="`闲置锁屏：${label}`" @click="cycle">
    {{ label }}
  </button>
</template>

<style scoped>
.idle-lock-toggle {
  border: 1px solid var(--color-border);
  border-radius: 0.4rem;
  background: var(--color-background);
  color: var(--color-text);
  padding: 0.3rem 0.65rem;
  font: inherit;
  cursor: pointer;
}
</style>
