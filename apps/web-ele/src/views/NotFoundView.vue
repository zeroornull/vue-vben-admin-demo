<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <main class="page">
    <h1>404</h1>
    <p>没有这个页面。</p>
    <p><RouterLink to="/">回工作台</RouterLink></p>
  </main>
</template>

<style scoped>
.page {
  min-height: 100vh;
  padding: 2rem;
}

h1 {
  color: var(--color-heading);
}
</style>
