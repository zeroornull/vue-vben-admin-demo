<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <section class="card">
    <h3>{{ title }}</h3>
    <slot />
  </section>
</template>

<style scoped>
.card {
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  background: var(--color-background-soft);
  padding: 1rem 1.1rem 1.15rem;
}

h3 {
  margin-bottom: 0.85rem;
  font-size: 1rem;
  font-weight: 650;
  color: var(--color-heading);
}
</style>
