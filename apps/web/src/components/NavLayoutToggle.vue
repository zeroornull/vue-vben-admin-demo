<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import { navLayoutLabels, nextNavLayout, normalizeNavLayout } from '@/preferences/nav-layout'
import { usePreferencesStore } from '@/stores/preferences'

const preferences = usePreferencesStore()
const { navLayout } = storeToRefs(preferences)
const label = computed(() => navLayoutLabels[normalizeNavLayout(navLayout.value)])

function cycle() {
  preferences.setNavLayout(nextNavLayout(normalizeNavLayout(navLayout.value)))
}
</script>

<template>
  <button class="nav-layout-toggle" type="button" :title="`导航：${label}`" @click="cycle">
    {{ label }}
  </button>
</template>

<style scoped>
.nav-layout-toggle {
  border: 1px solid var(--color-border);
  border-radius: 0.4rem;
  background: var(--color-background);
  color: var(--color-text);
  padding: 0.3rem 0.65rem;
  font: inherit;
  cursor: pointer;
}
</style>
