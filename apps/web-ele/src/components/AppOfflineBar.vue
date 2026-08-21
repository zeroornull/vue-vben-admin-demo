<script setup lang="ts">
import { computed } from 'vue'

import { OFFLINE_BANNER_TEXT, shouldShowOfflineBanner } from '@/network/online'
import { useOnline } from '@/network/use-online'

const online = useOnline()
const visible = computed(() => shouldShowOfflineBanner(online.value))
</script>

<template>
  <div v-if="visible" class="bar" role="status">
    {{ OFFLINE_BANNER_TEXT }}
  </div>
</template>

<style scoped>
.bar {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 51;
  border-top: 1px solid var(--color-border);
  background: var(--color-background-soft);
  padding: 0.45rem 1rem;
  font-size: 0.85rem;
  text-align: center;
}
</style>
