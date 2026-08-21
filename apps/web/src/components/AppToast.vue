<script setup lang="ts">
import { onUnmounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'

import { TOAST_MS } from '@app/request'
import { useRequestStore } from '@/stores/request'

const request = useRequestStore()
const { notice } = storeToRefs(request)
const visible = ref(false)
let hideTimer = 0

watch(notice, (text) => {
  window.clearTimeout(hideTimer)
  if (!text) {
    visible.value = false
    return
  }
  visible.value = true
  hideTimer = window.setTimeout(() => {
    request.dismiss()
  }, TOAST_MS)
})

onUnmounted(() => {
  window.clearTimeout(hideTimer)
})
</script>

<template>
  <button
    v-if="visible && notice"
    class="toast"
    type="button"
    role="alert"
    @click="request.dismiss()"
  >
    {{ notice }}
  </button>
</template>

<style scoped>
.toast {
  position: fixed;
  top: 0.85rem;
  left: 50%;
  z-index: 55;
  max-width: min(32rem, calc(100vw - 2rem));
  border: 1px solid color-mix(in srgb, #c23d3d 35%, var(--color-border));
  border-radius: 0.45rem;
  background: var(--color-background);
  color: #c23d3d;
  padding: 0.55rem 0.85rem;
  font: inherit;
  line-height: 1.4;
  box-shadow: 0 8px 24px rgb(0 0 0 / 12%);
  transform: translateX(-50%);
  cursor: pointer;
}
</style>
