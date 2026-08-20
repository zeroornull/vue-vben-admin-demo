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
      个人中心只能改显示名。顶栏圆点和锁屏上的名字会跟着变。系统用户表里的 Alice 不会变。
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
