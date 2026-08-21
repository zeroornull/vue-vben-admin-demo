<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import { normalizeSidebarWidth } from '@/preferences/sidebar-width'
import { usePreferencesStore } from '@/stores/preferences'

const preferences = usePreferencesStore()
const { sidebarWidth } = storeToRefs(preferences)
const width = computed(() => normalizeSidebarWidth(sidebarWidth.value))

function reset() {
  preferences.resetSidebarWidth()
}
</script>

<template>
  <button
    class="sidebar-width-reset"
    type="button"
    title="只作用于宽屏展开侧栏。拖侧栏右边调整。点这里回到 220"
    @click="reset"
  >
    侧栏 {{ width }}
  </button>
</template>
