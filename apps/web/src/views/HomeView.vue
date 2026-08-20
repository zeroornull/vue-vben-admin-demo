<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import { useAuthStore } from '@/stores/auth'

const { userInfo } = storeToRefs(useAuthStore())
const isAdmin = computed(() => userInfo.value?.roles.includes('admin'))
</script>

<template>
  <div class="page">
    <p>
      工作台始终在。侧栏看菜单码，新建/编辑/删除看操作码。
      「关于」还要登录角色是 <code>admin</code>。
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
