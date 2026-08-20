<script setup lang="ts">
import { useTheme } from '@/preferences/use-theme'

const { cycleTheme, themeLabel } = useTheme()
</script>

<template>
  <button class="theme-toggle" type="button" :title="`外观：${themeLabel}`" @click="cycleTheme">
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
