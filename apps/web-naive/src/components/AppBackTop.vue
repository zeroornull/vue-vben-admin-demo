<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { storeToRefs } from 'pinia'

import { shouldShowBackTop } from '@/layouts/back-top'
import { useLockStore } from '@/stores/lock'

const { locked } = storeToRefs(useLockStore())
const scrollTop = ref(0)

const visible = computed(() => shouldShowBackTop(scrollTop.value) && !locked.value)

function onScroll() {
  scrollTop.value = window.scrollY
}

function goTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  scrollTop.value = window.scrollY
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <button
    v-if="visible"
    class="back-top"
    type="button"
    title="回到顶部"
    @click="goTop"
  >
    顶部
  </button>
</template>

<style scoped>
.back-top {
  position: fixed;
  right: 1.25rem;
  bottom: 1.25rem;
  z-index: 10;
  border: 1px solid var(--color-border);
  border-radius: 0.4rem;
  background: var(--color-background);
  color: var(--color-text);
  padding: 0.4rem 0.7rem;
  font: inherit;
  box-shadow: 0 8px 24px rgb(0 0 0 / 12%);
  cursor: pointer;
}
</style>
