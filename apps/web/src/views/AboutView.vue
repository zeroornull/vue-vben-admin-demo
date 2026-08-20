<script setup lang="ts">
defineOptions({ name: 'AboutView' })

import { ref } from 'vue'

import { useUpdatesStore } from '@/stores/updates'

const updates = useUpdatesStore()
const bumping = ref(false)
const errorMessage = ref('')

async function onSimulate() {
  errorMessage.value = ''
  bumping.value = true
  try {
    await updates.simulateRelease()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '模拟发版失败'
  } finally {
    bumping.value = false
  }
}
</script>

<template>
  <div class="page">
    <p>这条路由的 <code>meta.roles</code> 是 <code>['admin']</code>，user 看不到菜单项。</p>
    <p>顶上检查更新每 60 秒问一次版本号，不走进度条。下面按钮只是给本地把 mock 版本号 +1。</p>
    <button :disabled="bumping" type="button" @click="onSimulate">
      {{ bumping ? '模拟中…' : '模拟发版' }}
    </button>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </div>
</template>

<style scoped>
.page {
  display: grid;
  gap: 0.75rem;
  max-width: 40rem;
}

button {
  width: fit-content;
  border: 1px solid var(--color-border);
  border-radius: 0.4rem;
  background: var(--color-background);
  color: var(--color-text);
  padding: 0.3rem 0.65rem;
  font: inherit;
  cursor: pointer;
}

.error {
  color: #c23d3d;
  font-size: 0.9rem;
}
</style>
