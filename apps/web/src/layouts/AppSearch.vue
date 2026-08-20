<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

import { resolveMenuIcon } from '@/icons/menu-icons'
import { filterSearchItems, menuItemTo, useSearchItems, type AccessMenuItem } from '@/router/access-menu'
import { useLockStore } from '@/stores/lock'

const lockStore = useLockStore()
const { locked } = storeToRefs(lockStore)
const router = useRouter()
const items = useSearchItems()
const open = ref(false)
const keyword = ref('')
const input = ref<HTMLInputElement | null>(null)

const hits = computed(() => filterSearchItems(items.value, keyword.value))

async function openSearch() {
  if (locked.value) return
  open.value = true
  keyword.value = ''
  await nextTick()
  input.value?.focus()
}

function closeSearch() {
  open.value = false
  keyword.value = ''
}

function toggleSearch() {
  if (open.value) closeSearch()
  else void openSearch()
}

async function go(item: AccessMenuItem) {
  closeSearch()
  await router.push(menuItemTo(item))
}

function onDocumentKey(event: KeyboardEvent) {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    toggleSearch()
    return
  }
  if (event.key === 'Escape' && open.value) {
    event.preventDefault()
    closeSearch()
  }
}

function onEnter() {
  const first = hits.value[0]
  if (first) void go(first)
}

watch(locked, (isLocked) => {
  if (isLocked) closeSearch()
})

onMounted(() => {
  window.addEventListener('keydown', onDocumentKey)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onDocumentKey)
})
</script>

<template>
  <div class="search">
    <button type="button" class="trigger" title="搜索菜单 Ctrl+K" @click="toggleSearch">
      搜索
    </button>
    <Teleport to="body">
      <div v-if="open" class="overlay" @click.self="closeSearch">
        <div class="panel" role="dialog" aria-label="搜索菜单">
          <input
            ref="input"
            v-model="keyword"
            type="search"
            placeholder="搜标题、路由名或分组"
            @keydown.enter.prevent="onEnter"
          />
          <p v-if="!hits.length" class="empty">没有匹配的页面</p>
          <ul v-else>
            <li v-for="item in hits" :key="item.path || item.name">
              <button type="button" @click="go(item)">
                <component
                  v-if="resolveMenuIcon(item.icon)"
                  :is="resolveMenuIcon(item.icon)"
                  class="icon"
                />
                <span>{{ item.title }}</span>
                <small v-if="item.group">{{ item.group }}</small>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.trigger {
  border: 1px solid var(--color-border);
  border-radius: 0.4rem;
  background: var(--color-background);
  color: var(--color-text);
  padding: 0.3rem 0.65rem;
  font: inherit;
  cursor: pointer;
}

.overlay {
  position: fixed;
  inset: 0;
  z-index: 30;
  display: grid;
  align-content: start;
  justify-items: center;
  padding: 12vh 1rem 1rem;
  background: rgb(0 0 0 / 35%);
}

.panel {
  width: min(100%, 28rem);
  border: 1px solid var(--color-border);
  border-radius: 0.55rem;
  background: var(--color-background);
  padding: 0.75rem;
  box-shadow: 0 12px 32px rgb(0 0 0 / 16%);
}

input {
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: 0.4rem;
  background: var(--color-background-soft);
  color: var(--color-text);
  padding: 0.55rem 0.7rem;
  font: inherit;
}

ul {
  display: grid;
  gap: 0.25rem;
  margin: 0.6rem 0 0;
  padding: 0;
  list-style: none;
  max-height: 16rem;
  overflow: auto;
}

li button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  border: 0;
  border-radius: 0.35rem;
  background: transparent;
  color: var(--color-text);
  padding: 0.4rem 0.5rem;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

li button:hover {
  background: var(--color-background-mute);
}

.icon {
  font-size: 1rem;
}

small {
  margin-left: auto;
  opacity: 0.5;
  font-size: 0.75rem;
}

.empty {
  margin: 0.7rem 0 0;
  font-size: 0.85rem;
  opacity: 0.6;
}
</style>
