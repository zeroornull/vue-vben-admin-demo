<script setup lang="ts">
import { onUnmounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'

import { hideDelayMs, MIN_BAR_VISIBLE_MS } from '@/api/pending'
import { useRequestStore } from '@/stores/request'

const { active } = storeToRefs(useRequestStore())
const visible = ref(false)
let shownAt = 0
let hideTimer = 0

watch(active, (on) => {
  if (on) {
    window.clearTimeout(hideTimer)
    if (!visible.value) {
      shownAt = Date.now()
      visible.value = true
    }
    return
  }
  if (!visible.value) return
  hideTimer = window.setTimeout(() => {
    visible.value = false
  }, hideDelayMs(shownAt, Date.now(), MIN_BAR_VISIBLE_MS))
})

onUnmounted(() => {
  window.clearTimeout(hideTimer)
})
</script>

<template>
  <div
    v-if="visible"
    class="bar"
    role="progressbar"
    aria-label="请求进行中"
    aria-busy="true"
  />
</template>

<style scoped>
.bar {
  position: fixed;
  inset: 0 auto auto 0;
  z-index: 50;
  width: 100%;
  height: 2px;
  overflow: hidden;
  pointer-events: none;
  background: color-mix(in srgb, #42b883 22%, transparent);
}

.bar::after {
  content: '';
  display: block;
  width: 36%;
  height: 100%;
  background: #42b883;
  animation: slide 0.75s ease-in-out infinite;
}

@keyframes slide {
  0% {
    transform: translateX(-120%);
  }
  100% {
    transform: translateX(380%);
  }
}
</style>
