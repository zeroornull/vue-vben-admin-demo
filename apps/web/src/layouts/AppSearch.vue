<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

import { useDisplayTitle } from '@/i18n/display'
import MenuIcon from '@/icons/MenuIcon.vue'
import { resolveMenuIcon } from '@/icons/menu-icons'
import { menuItemTo, useSearchItems, type AccessMenuItem } from '@/router/access-menu'
import {
  clampSearchCursor,
  flattenSearchHits,
  jumpSearchCursor,
  moveSearchCursor,
  searchCursorKey,
  searchDigitIndex,
  searchHitAt,
} from '@/search/cursor'
import { searchListWithoutRecents } from '@/search/recents'
import { useAuthStore } from '@/stores/auth'
import { useLockStore } from '@/stores/lock'
import { useSearchRecentsStore } from '@/stores/search-recents'

const lockStore = useLockStore()
const { locked } = storeToRefs(lockStore)
const authStore = useAuthStore()
const { userInfo } = storeToRefs(authStore)
const recentsStore = useSearchRecentsStore()
const router = useRouter()
const items = useSearchItems()
const { groupTitle, menuTitle } = useDisplayTitle()
const labeledItems = computed(() =>
  items.value.map((item) => {
    const group = 'group' in item ? item.group : undefined
    return {
      ...item,
      group: groupTitle(group) ?? group,
      title: menuTitle(item),
    }
  }),
)
const open = ref(false)
const keyword = ref('')
const input = ref<HTMLInputElement | null>(null)
const panel = ref<HTMLElement | null>(null)
const cursor = ref(0)
const username = computed(() => userInfo.value?.username ?? '')
const recents = computed(() =>
  keyword.value.trim() ? [] : recentsStore.listFor(username.value, labeledItems.value),
)
const rest = computed(() => searchListWithoutRecents(labeledItems.value, keyword.value, recents.value))
const flat = computed(() => flattenSearchHits(recents.value, rest.value))
const empty = computed(() => !flat.value.length)
const recentOffset = computed(() => recents.value.length)

function resetCursor() {
  cursor.value = flat.value.length ? 0 : -1
}

async function openSearch() {
  if (locked.value) return
  open.value = true
  keyword.value = ''
  resetCursor()
  await nextTick()
  input.value?.focus()
}

function closeSearch() {
  open.value = false
  keyword.value = ''
  cursor.value = -1
}

function toggleSearch() {
  if (open.value) closeSearch()
  else void openSearch()
}

async function go(item: AccessMenuItem) {
  recentsStore.remember(username.value, item)
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
  const hit = searchHitAt(flat.value, cursor.value)
  if (hit) void go(hit)
}

function onInputKey(event: KeyboardEvent) {
  if (event.isComposing) return
  const digit = searchDigitIndex(event.key, keyword.value, flat.value.length)
  if (digit !== null) {
    event.preventDefault()
    const hit = searchHitAt(flat.value, digit)
    if (hit) void go(hit)
    return
  }
  const jump = jumpSearchCursor(event.key, flat.value.length)
  if (jump !== null) {
    event.preventDefault()
    cursor.value = jump
    return
  }
  const step = searchCursorKey(event)
  if (step) {
    event.preventDefault()
    cursor.value = moveSearchCursor(cursor.value, step, flat.value.length)
    return
  }
  if (event.key === 'Enter') {
    event.preventDefault()
    onEnter()
  }
}

function restIndex(index: number) {
  return recentOffset.value + index
}

function onHover(index: number) {
  cursor.value = index
}

function onClearRecents() {
  recentsStore.clear(username.value)
}

watch(locked, (isLocked) => {
  if (isLocked) closeSearch()
})

watch([keyword, () => flat.value.length], () => {
  if (!open.value) return
  cursor.value = clampSearchCursor(0, flat.value.length)
})

watch(cursor, async () => {
  await nextTick()
  panel.value?.querySelector<HTMLElement>('[data-active="true"]')?.scrollIntoView({ block: 'nearest' })
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
        <div ref="panel" class="panel" role="dialog" aria-label="搜索菜单">
          <input
            ref="input"
            v-model="keyword"
            type="search"
            placeholder="搜标题、路由名或分组"
            @keydown="onInputKey"
          />
          <p v-if="empty" class="empty">没有匹配的页面</p>
          <template v-else>
            <div v-if="recents.length" class="section">
              <span>最近</span>
              <button type="button" class="clear" @click="onClearRecents">清除</button>
            </div>
            <ul v-if="recents.length">
              <li v-for="(item, index) in recents" :key="`recent-${item.path || item.name}`">
                <button
                  type="button"
                  :data-active="cursor === index"
                  @mouseenter="onHover(index)"
                  @click="go(item)"
                >
                  <MenuIcon v-if="resolveMenuIcon(item.icon)" :name="item.icon" class="icon" />
                  <span>{{ item.title }}</span>
                  <small v-if="item.group">{{ item.group }}</small>
                </button>
              </li>
            </ul>
            <p v-if="rest.length && recents.length" class="section">全部</p>
            <ul v-if="rest.length">
              <li v-for="(item, index) in rest" :key="item.path || item.name">
                <button
                  type="button"
                  :data-active="cursor === restIndex(index)"
                  @mouseenter="onHover(restIndex(index))"
                  @click="go(item)"
                >
                  <MenuIcon v-if="resolveMenuIcon(item.icon)" :name="item.icon" class="icon" />
                  <span>{{ item.title }}</span>
                  <small v-if="item.group">{{ item.group }}</small>
                </button>
              </li>
            </ul>
          </template>
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

li button:hover,
li button[data-active='true'] {
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

.section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0.7rem 0 0.25rem;
  font-size: 0.75rem;
  opacity: 0.55;
}

.clear {
  border: 0;
  background: transparent;
  color: inherit;
  padding: 0;
  font: inherit;
  cursor: pointer;
}
</style>
