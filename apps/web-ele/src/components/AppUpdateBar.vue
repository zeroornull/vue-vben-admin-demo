<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'

import { useLockStore } from '@/stores/lock'
import { useUpdatesStore } from '@/stores/updates'
import { VERSION_POLL_MS, shouldPollVersion } from '@/updates/version'

const updates = useUpdatesStore()
const { outdated } = storeToRefs(updates)
const { locked } = storeToRefs(useLockStore())

let timer = 0

async function tick() {
  if (!shouldPollVersion(document.hidden, locked.value)) return
  try {
    await updates.pull()
  } catch {
    // 轮询失败不出条、不挡页面
  }
}

function onVisibility() {
  if (!document.hidden) void tick()
}

onMounted(() => {
  void tick()
  timer = window.setInterval(() => {
    void tick()
  }, VERSION_POLL_MS)
  document.addEventListener('visibilitychange', onVisibility)
})

onUnmounted(() => {
  window.clearInterval(timer)
  document.removeEventListener('visibilitychange', onVisibility)
})
</script>

<template>
  <div v-if="outdated" class="bar" role="status">
    <span>有新版本，刷新后才是最新代码。这不是当前页重挂。</span>
    <button type="button" @click="updates.reload()">刷新</button>
    <button type="button" class="later" @click="updates.dismiss()">稍后</button>
  </div>
</template>

<style scoped>
.bar {
  position: fixed;
  top: 0.75rem;
  left: 50%;
  z-index: 52;
  display: flex;
  align-items: center;
  gap: 0.55rem;
  max-width: min(36rem, calc(100vw - 2rem));
  border: 1px solid var(--color-border);
  border-radius: 0.45rem;
  background: var(--color-background);
  padding: 0.5rem 0.7rem;
  font-size: 0.85rem;
  box-shadow: 0 8px 24px rgb(0 0 0 / 12%);
  transform: translateX(-50%);
}

button {
  border: 1px solid var(--color-border);
  border-radius: 0.35rem;
  background: var(--color-background-soft);
  color: var(--color-text);
  padding: 0.2rem 0.5rem;
  font: inherit;
  cursor: pointer;
}

.later {
  opacity: 0.7;
}
</style>
