<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import { useAuthStore } from '@/stores/auth'

const { userInfo } = storeToRefs(useAuthStore())
const isAdmin = computed(() => userInfo.value?.roles.includes('admin'))
</script>

<template>
  <div class="page">
    <p>已登录。侧栏菜单来自 <code>layoutChildren</code>，按角色过滤；刷新后菜单仍在。业务示例在「工作区」。</p>
    <p v-if="!isAdmin">当前是 user，侧栏不会出现「关于」。直接打开 /about 会到 403。</p>
  </div>
</template>

<style scoped>
.page {
  display: grid;
  gap: 0.75rem;
  max-width: 40rem;
}
</style>
