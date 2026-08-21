<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import { useTheme } from '@/preferences/use-theme'
import {
  shouldShowWatermark,
  watermarkText,
  watermarkTileUrl,
} from '@/preferences/watermark'
import { useAuthStore } from '@/stores/auth'
import { usePreferencesStore } from '@/stores/preferences'

const { userInfo } = storeToRefs(useAuthStore())
const { watermarkEnabled } = storeToRefs(usePreferencesStore())
const { resolved } = useTheme()

const text = computed(() => watermarkText(userInfo.value))
const visible = computed(() => shouldShowWatermark(watermarkEnabled.value, text.value))
const tile = computed(() => watermarkTileUrl(text.value, resolved.value === 'dark'))
</script>

<template>
  <div
    v-if="visible"
    class="watermark"
    :style="{ backgroundImage: tile }"
    aria-hidden="true"
  />
</template>

<style scoped>
.watermark {
  position: fixed;
  inset: 0;
  z-index: 6;
  pointer-events: none;
  background-repeat: repeat;
}
</style>
