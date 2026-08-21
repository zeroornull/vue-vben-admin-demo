<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'

import { useAuthStore } from '@/stores/auth'

import { COPY_FEEDBACK_MS, copyPathLabel, copyableFullPath, writeClipboardText } from './copy-path'
import { shouldClosePopover } from './popover'
import { userMenuMeta } from './user-menu'

const emit = defineEmits<{
  lock: []
  logout: []
}>()

const route = useRoute()
const { userInfo } = storeToRefs(useAuthStore())
const meta = computed(() => userMenuMeta(userInfo.value))
const open = ref(false)
const copied = ref(false)
const root = ref<HTMLElement | null>(null)
let copiedTimer = 0

const copyLabel = computed(() => copyPathLabel(copied.value))

function close() {
  open.value = false
  copied.value = false
}

function toggle() {
  open.value = !open.value
}

function onDocumentPointer(event: PointerEvent) {
  if (shouldClosePopover(event, root.value, open.value)) close()
}

function onKey(event: KeyboardEvent) {
  if (event.key !== 'Escape' || !open.value) return
  event.preventDefault()
  close()
}

function onLock() {
  close()
  emit('lock')
}

function onLogout() {
  close()
  emit('logout')
}

async function onCopyPath() {
  const text = copyableFullPath(route.fullPath)
  if (!text || !navigator.clipboard) return
  const ok = await writeClipboardText(text, navigator.clipboard)
  if (!ok) return
  copied.value = true
  window.clearTimeout(copiedTimer)
  copiedTimer = window.setTimeout(() => {
    copied.value = false
  }, COPY_FEEDBACK_MS)
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointer)
  window.addEventListener('keydown', onKey)
})

onUnmounted(() => {
  document.removeEventListener('pointerdown', onDocumentPointer)
  window.removeEventListener('keydown', onKey)
  window.clearTimeout(copiedTimer)
})
</script>

<template>
  <div v-if="meta" ref="root" class="user-menu">
    <button
      type="button"
      class="trigger"
      :aria-expanded="open"
      aria-haspopup="menu"
      :title="meta.label"
      @click="toggle"
    >
      <span class="avatar" aria-hidden="true">{{ meta.initial }}</span>
      <span class="user-label">{{ meta.label }}</span>
    </button>
    <div v-if="open" class="panel" role="menu">
      <p>
        <strong>{{ meta.username }}</strong>
      </p>
      <p>登录角色 {{ meta.loginRoles }}</p>
      <p>业务角色 {{ meta.bizRoles }}</p>
      <div class="actions">
        <button type="button" role="menuitem" :title="route.fullPath" @click="onCopyPath">
          {{ copyLabel }}
        </button>
        <RouterLink :to="{ name: 'profile' }" role="menuitem" @click="close">个人中心</RouterLink>
        <button type="button" role="menuitem" @click="onLock">锁定屏幕</button>
        <button type="button" role="menuitem" @click="onLogout">退出</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-menu {
  position: relative;
}

.trigger,
.panel button,
.panel a {
  border: 1px solid var(--color-border);
  border-radius: 0.4rem;
  background: var(--color-background);
  color: var(--color-text);
  padding: 0.2rem 0.55rem 0.2rem 0.25rem;
  font: inherit;
  cursor: pointer;
}

.trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.panel button,
.panel a {
  padding: 0.3rem 0.65rem;
}

.panel a {
  text-decoration: none;
}

.avatar {
  display: inline-grid;
  place-items: center;
  width: 1.6rem;
  height: 1.6rem;
  border-radius: 999px;
  background: var(--color-background-mute);
  color: var(--color-heading);
  font-size: 0.78rem;
  font-weight: 650;
}

.panel {
  position: absolute;
  top: calc(100% + 0.35rem);
  right: 0;
  z-index: 8;
  display: grid;
  gap: 0.35rem;
  min-width: 11.5rem;
  border: 1px solid var(--color-border);
  border-radius: 0.45rem;
  background: var(--color-background);
  padding: 0.7rem 0.75rem 0.6rem;
  box-shadow: 0 8px 24px rgb(0 0 0 / 12%);
}

.panel p {
  margin: 0;
  font-size: 0.78rem;
  opacity: 0.75;
}

.panel strong {
  font-size: 0.88rem;
  font-weight: 650;
  color: var(--color-heading);
  opacity: 1;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.15rem;
}
</style>
