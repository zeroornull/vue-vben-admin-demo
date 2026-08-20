<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import { crumbsFromRoute, shouldShowCrumbs } from './breadcrumb'

const route = useRoute()

const crumbs = computed(() =>
  crumbsFromRoute({
    meta: route.meta,
    name: String(route.name ?? ''),
  }),
)

const visible = computed(() => shouldShowCrumbs(crumbs.value))
</script>

<template>
  <nav v-if="visible" class="crumbs" aria-label="面包屑">
    <ol>
      <li v-for="(crumb, index) in crumbs" :key="`${crumb.title}-${index}`">
        <RouterLink v-if="crumb.name && !crumb.current" :to="{ name: crumb.name }">
          {{ crumb.title }}
        </RouterLink>
        <span v-else :aria-current="crumb.current ? 'page' : undefined">{{ crumb.title }}</span>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.crumbs {
  min-width: 0;
  padding: 0.55rem 1.5rem 0;
  font-size: 0.82rem;
}

ol {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.2rem 0.35rem;
  margin: 0;
  padding: 0;
  list-style: none;
  color: var(--color-text);
}

li:not(:last-child)::after {
  content: '/';
  margin-left: 0.35rem;
  opacity: 0.4;
}

a {
  color: inherit;
  opacity: 0.7;
}

a:hover {
  opacity: 1;
}

[aria-current='page'] {
  color: var(--color-heading);
  font-weight: 600;
}
</style>
