<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

import MenuIcon from '@/icons/MenuIcon.vue'
import { resolveMenuIcon } from '@/icons/menu-icons'
import { shouldClosePopover } from '@/layouts/popover'
import { useDisplayTitle } from '@/i18n/display'
import {
  tabIconName,
  tabMenuActions,
  type AppTab,
  type TabMenuAction,
} from '@/layouts/tab-query'
import { useTabsStore } from '@/stores/tabs'

const emit = defineEmits<{
  refresh: []
}>()

const route = useRoute()
const router = useRouter()
const tabsStore = useTabsStore()
const { tabs } = storeToRefs(tabsStore)
const { menuTitle, t } = useDisplayTitle()

function tabLabel(tab: AppTab) {
  return menuTitle({ name: tab.name, path: tab.fullPath, title: tab.title })
}

const canCloseOthers = computed(() => {
  return tabs.value.filter((tab) => !tab.affix && tab.name !== route.name).length > 0
})

const menu = ref<{ name: string; x: number; y: number } | null>(null)
const menuRoot = ref<HTMLElement | null>(null)
const draggingName = ref('')
const dropName = ref('')
const suppressClick = ref(false)

const menuActions = computed(() => (menu.value ? tabMenuActions(tabs.value, menu.value.name) : []))

function closeMenu() {
  menu.value = null
}

async function goIfNeeded(path: string | null) {
  if (path) await router.replace(path)
}

async function onSelect(fullPath: string) {
  if (suppressClick.value) return
  if (fullPath === route.fullPath) return
  await router.push(fullPath)
}

async function onClose(name: string) {
  closeMenu()
  await goIfNeeded(tabsStore.close(name, String(route.name ?? '')))
}

async function onCloseOthers() {
  closeMenu()
  if (typeof route.name !== 'string') return
  await goIfNeeded(tabsStore.closeOthers(route.name, route.name))
}

function onContextMenu(event: MouseEvent, tab: AppTab) {
  event.preventDefault()
  menu.value = { name: tab.name, x: event.clientX, y: event.clientY }
}

async function onMenuAction(action: TabMenuAction) {
  const name = menu.value?.name
  closeMenu()
  if (!name) return
  const current = String(route.name ?? '')
  if (action === 'refresh') {
    const tab = tabs.value.find((item) => item.name === name)
    if (tab && route.name !== tab.name) {
      await router.push(tab.fullPath)
    }
    emit('refresh')
    return
  }
  if (action === 'close') {
    await goIfNeeded(tabsStore.close(name, current))
    return
  }
  if (action === 'closeOthers') {
    await goIfNeeded(tabsStore.closeOthers(name, current))
    return
  }
  if (action === 'closeLeft') {
    await goIfNeeded(tabsStore.closeLeft(name, current))
    return
  }
  if (action === 'closeRight') {
    await goIfNeeded(tabsStore.closeRight(name, current))
    return
  }
  await goIfNeeded(tabsStore.closeAll(current))
}

function onDragStart(event: DragEvent, tab: AppTab) {
  if (tab.affix) {
    event.preventDefault()
    return
  }
  draggingName.value = tab.name
  event.dataTransfer?.setData('text/plain', tab.name)
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
}

function onDragOver(event: DragEvent, tab: AppTab) {
  if (!draggingName.value || draggingName.value === tab.name) return
  event.preventDefault()
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
  dropName.value = tab.name
}

function onDrop(event: DragEvent, tab: AppTab) {
  event.preventDefault()
  const from = draggingName.value || event.dataTransfer?.getData('text/plain') || ''
  if (from) tabsStore.reorder(from, tab.name)
  draggingName.value = ''
  dropName.value = ''
  suppressClick.value = true
}

function onDragEnd() {
  draggingName.value = ''
  dropName.value = ''
  window.setTimeout(() => {
    suppressClick.value = false
  }, 0)
}

function onDocumentPointer(event: PointerEvent) {
  if (shouldClosePopover(event, menuRoot.value, Boolean(menu.value))) closeMenu()
}

function onKey(event: KeyboardEvent) {
  if (event.key !== 'Escape' || !menu.value) return
  event.preventDefault()
  closeMenu()
}

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
  <div class="tabs" role="tablist">
    <div class="list">
      <button
        v-for="tab in tabs"
        :key="tab.name"
        :aria-selected="route.name === tab.name"
        :class="['tab', { drop: dropName === tab.name, dragging: draggingName === tab.name }]"
        :draggable="!tab.affix"
        role="tab"
        type="button"
        @click="onSelect(tab.fullPath)"
        @contextmenu="onContextMenu($event, tab)"
        @dragend="onDragEnd"
        @dragover="onDragOver($event, tab)"
        @dragstart="onDragStart($event, tab)"
        @drop="onDrop($event, tab)"
      >
        <MenuIcon v-if="resolveMenuIcon(tabIconName(tab))" :name="tabIconName(tab)" class="tab-icon" />
        <span>{{ tabLabel(tab) }}</span>
        <button
          v-if="!tab.affix"
          class="close"
          type="button"
          :aria-label="t('tab.closeNamed', { title: tabLabel(tab) })"
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
      {{ t('tab.closeOthers') }}
    </button>
    <div
      v-if="menu"
      ref="menuRoot"
      class="menu"
      role="menu"
      :style="{ left: `${menu.x}px`, top: `${menu.y}px` }"
    >
      <button
        v-for="action in menuActions"
        :key="action"
        type="button"
        role="menuitem"
        @click="onMenuAction(action)"
      >
        {{ t(`tab.${action}`) }}
      </button>
    </div>
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

.tab.dragging {
  opacity: 0.45;
}

.tab.drop {
  border-color: var(--color-heading);
}

.close,
.more,
.menu button {
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

.menu {
  position: fixed;
  z-index: 31;
  display: grid;
  min-width: 7.5rem;
  border: 1px solid var(--color-border);
  border-radius: 0.45rem;
  background: var(--color-background);
  padding: 0.35rem;
  box-shadow: 0 8px 24px rgb(0 0 0 / 12%);
}

.menu button {
  border-radius: 0.3rem;
  padding: 0.3rem 0.55rem;
  text-align: left;
}

.menu button:hover {
  background: var(--color-background-mute);
}
</style>
