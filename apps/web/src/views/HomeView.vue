<script setup lang="ts">
defineOptions({ name: 'HomeView' })

import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import { useAuthStore } from '@/stores/auth'

const { userInfo } = storeToRefs(useAuthStore())
const isAdmin = computed(() => userInfo.value?.roles.includes('admin'))
</script>

<template>
  <div class="page">
    <p>
      GET 遇到 5xx 或断网会立刻再打一次。登录和其它写操作不重试。通知、检查更新这些轮询自己关掉重试。
    </p>
    <p v-access:role="'admin'">
      这段用 <code>v-access:role="'admin'"</code>，看的是登录角色，不是业务角色码 biz-admin。
    </p>
    <p v-if="!isAdmin">
      当前是 user，默认绑访客：只有工作区和分析。直接打开 /users 或 /about 会到 403。
    </p>
  </div>
</template>

<style scoped>
.page {
  display: grid;
  gap: 0.75rem;
  max-width: 40rem;
}
</style>
