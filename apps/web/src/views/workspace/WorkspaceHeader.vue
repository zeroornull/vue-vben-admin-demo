<script setup lang="ts">
defineProps<{
  description: string
  realName: string
  todoDone: number
  todoTotal: number
}>()
</script>

<template>
  <section class="card header">
    <div>
      <h2>早安，{{ realName }}，开始您一天的工作吧！</h2>
      <p>{{ description }}</p>
    </div>
    <dl>
      <div>
        <dt>待办</dt>
        <dd>{{ todoDone }}/{{ todoTotal }}</dd>
      </div>
      <div>
        <dt>项目</dt>
        <dd>6</dd>
      </div>
    </dl>
  </section>
</template>

<style scoped>
.card {
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  background: var(--color-background-soft);
  padding: 1.1rem 1.25rem;
}

.header {
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
  align-items: center;
  flex-wrap: wrap;
}

h2 {
  font-size: 1.15rem;
  font-weight: 650;
  color: var(--color-heading);
}

p,
dt {
  opacity: 0.72;
}

dl {
  display: flex;
  gap: 1.75rem;
}

dd {
  font-size: 1.4rem;
  font-weight: 650;
  color: var(--color-heading);
}
</style>
