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
      顶栏「全屏」只藏侧栏、顶栏、页签和面包屑，不是浏览器的 F11。Escape 或右上角「退出全屏」可退。刷新后壳会回来。
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
