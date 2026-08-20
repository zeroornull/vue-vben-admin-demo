<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

import { canAccessRoute, type AccessViewer } from '@/access/resolve'
import { noticeMatchesRoute, noticeTimeLabel } from '@/notices/query'
import { layoutChildren } from '@/router/routes'
import { useAuthStore } from '@/stores/auth'
import { useLockStore } from '@/stores/lock'
import { useNoticesStore } from '@/stores/notices'

import { shouldClosePopover } from './popover'

const router = useRouter()
const authStore = useAuthStore()
const lockStore = useLockStore()
const notices = useNoticesStore()
const { userInfo } = storeToRefs(authStore)
const { locked } = storeToRefs(lockStore)
const { badge, items, readIds } = storeToRefs(notices)

const open = ref(false)
const root = ref<HTMLElement | null>(null)

const viewer = computed<AccessViewer>(() => ({
  menuCodes: userInfo.value?.menuCodes ?? [],
  roles: userInfo.value?.roles ?? [],
}))

function close() {
  open.value = false
}

function toggle() {
  open.value = !open.value
}

function routeForHref(href: string | null) {
  if (!href) return null
  return layoutChildren.find((route) => noticeMatchesRoute(href, route.path)) ?? null
}

async function onOpen(id: string, href: string | null) {
  await notices.readOne(id)
  close()
  const route = routeForHref(href)
  if (!route || !canAccessRoute(route, viewer.value)) return
  await router.push({ name: route.name })
}

async function onReadAll() {
  await notices.readAll()
}

function onDocumentPointer(event: PointerEvent) {
  if (shouldClosePopover(event, root.value, open.value)) close()
}

function onKey(event: KeyboardEvent) {
  if (event.key !== 'Escape' || !open.value) return
  event.preventDefault()
  close()
}

watch(locked, (isLocked) => {
  if (isLocked) close()
})

watch(
  () => userInfo.value?.username,
  (name) => {
    if (name) void notices.pull()
    else notices.reset()
  },
  { immediate: true },
)

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointer)
  window.addEventListener('keydown', onKey)
})

onUnmounted(() => {
  document.removeEventListener('pointerdown', onDocumentPointer)
  window.removeEventListener('keydown', onKey)
})
</script>

<template>
  <div ref="root" class="notice-bell">
    <button
      type="button"
      class="trigger"
      :aria-expanded="open"
      aria-haspopup="menu"
      title="通知"
      @click="toggle"
    >
      通知
      <span v-if="badge" class="badge">{{ badge }}</span>
    </button>
    <div v-if="open" class="panel" role="menu">
      <div class="head">
        <strong>通知</strong>
        <button v-if="badge" type="button" @click="onReadAll">全部已读</button>
      </div>
      <p v-if="!items.length" class="empty">暂无通知</p>
      <button
        v-for="item in items"
        :key="item.id"
        type="button"
        class="item"
        :data-unread="!readIds.includes(item.id)"
        @click="onOpen(item.id, item.href)"
      >
        <span class="title">{{ item.title }}</span>
        <span class="body">{{ item.body }}</span>
        <span class="meta">{{ noticeTimeLabel(item.createdAt) }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.notice-bell {
  position: relative;
}

.trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.badge {
  min-width: 1.1rem;
  border-radius: 999px;
  background: var(--color-heading);
  color: var(--color-background);
  padding: 0 0.28rem;
  font-size: 0.68rem;
  line-height: 1.2rem;
  text-align: center;
}

.panel {
  position: absolute;
  top: calc(100% + 0.35rem);
  right: 0;
  z-index: 8;
  display: grid;
  gap: 0.4rem;
  width: min(20rem, 80vw);
  border: 1px solid var(--color-border);
  border-radius: 0.45rem;
  background: var(--color-background);
  padding: 0.6rem;
  box-shadow: 0 8px 24px rgb(0 0 0 / 12%);
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.head strong {
  color: var(--color-heading);
}

.empty {
  margin: 0;
  font-size: 0.82rem;
  opacity: 0.7;
}

.item {
  display: grid;
  gap: 0.2rem;
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: 0.4rem;
  background: var(--color-background);
  color: var(--color-text);
  padding: 0.45rem 0.55rem;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.item[data-unread='true'] {
  background: var(--color-background-mute);
}

.title {
  color: var(--color-heading);
  font-weight: 650;
}

.body,
.meta {
  font-size: 0.78rem;
  opacity: 0.75;
}
</style>
