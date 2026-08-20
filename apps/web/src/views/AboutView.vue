<script setup lang="ts">
defineOptions({ name: 'AboutView' })
</script>

<template>
  <div class="page">
    <p>这条路由的 <code>meta.roles</code> 是 <code>['admin']</code>，user 看不到菜单项。</p>
  </div>
</template>

<style scoped>
.page {
  max-width: 40rem;
}
</style>
