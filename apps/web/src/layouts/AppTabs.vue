<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

import { resolveMenuIcon } from '@/icons/menu-icons'
import { tabIconName } from '@/layouts/tab-query'
import { useTabsStore } from '@/stores/tabs'

const route = useRoute()
const router = useRouter()
const tabsStore = useTabsStore()
const { tabs } = storeToRefs(tabsStore)

const canCloseOthers = computed(() => {
  return tabs.value.filter((tab) => !tab.affix && tab.name !== route.name).length > 0
})

async function onSelect(fullPath: string) {
  if (fullPath === route.fullPath) return
  await router.push(fullPath)
}

async function onClose(name: string) {
  const next = tabsStore.close(name, String(route.name ?? ''))
  if (next) {
    await router.replace(next)
  }
}

function onCloseOthers() {
  if (typeof route.name === 'string') {
    tabsStore.closeOthers(route.name)
  }
}
</script>

<template>
  <div class="tabs" role="tablist">
    <div class="list">
      <button
        v-for="tab in tabs"
        :key="tab.name"
        :aria-selected="route.name === tab.name"
        class="tab"
        role="tab"
        type="button"
        @click="onSelect(tab.fullPath)"
      >
        <component
          v-if="resolveMenuIcon(tabIconName(tab))"
          :is="resolveMenuIcon(tabIconName(tab))"
          class="tab-icon"
        />
        <span>{{ tab.title }}</span>
        <button
          v-if="!tab.affix"
          class="close"
          type="button"
          :aria-label="`关闭 ${tab.title}`"
          @click.stop="onClose(tab.name)"
        >
          ×
        </button>
      </button>
    </div>
    <button
      v-if="canCloseOthers"
      class="more"
      type="button"
      @click="onCloseOthers"
    >
      关闭其他
    </button>
  </div>
</template>

<style scoped>
.tabs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
  border-bottom: 1px solid var(--color-border);
  padding: 0 1.25rem;
  background: var(--color-background-soft);
}

.list {
  display: flex;
  flex: 1;
  min-width: 0;
  gap: 0.25rem;
  overflow-x: auto;
  padding: 0.4rem 0;
}

.tab {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border: 1px solid transparent;
  border-radius: 0.35rem;
  background: transparent;
  color: var(--color-text);
  padding: 0.2rem 0.5rem;
  font: inherit;
  font-size: 0.85rem;
  white-space: nowrap;
  cursor: pointer;
}

.tab-icon {
  flex: 0 0 auto;
  font-size: 0.95rem;
}

.tab[aria-selected='true'] {
  background: var(--color-background);
  border-color: var(--color-border);
  color: var(--color-heading);
  font-weight: 600;
}

.close,
.more {
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  cursor: pointer;
}

.close {
  opacity: 0.55;
  padding: 0 0.15rem;
  line-height: 1;
}

.more {
  opacity: 0.7;
  font-size: 0.8rem;
  padding: 0.2rem 0.15rem;
}
</style>
