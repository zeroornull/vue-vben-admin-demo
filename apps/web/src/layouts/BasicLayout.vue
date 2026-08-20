<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

import { leaveSessionView } from '@/auth/session-leave'
import AppearanceMenu from '@/components/AppearanceMenu.vue'
import { resolveMenuIcon } from '@/icons/menu-icons'
import { normalizeNavLayout } from '@/preferences/nav-layout'
import {
  SIDEBAR_WIDTH_MAX,
  SIDEBAR_WIDTH_MIN,
  normalizeSidebarWidth,
  sidebarWidthByKey,
  sidebarWidthFromDrag,
} from '@/preferences/sidebar-width'
import { extraTabNames, menuItemTo, useAccessMenu } from '@/router/access-menu'
import { staticLayoutNames } from '@/router/routes'
import { useAuthStore } from '@/stores/auth'
import { useLinksStore } from '@/stores/links'
import { useLockStore } from '@/stores/lock'
import { usePreferencesStore } from '@/stores/preferences'
import { useTabsStore } from '@/stores/tabs'

import AppBreadcrumb from './AppBreadcrumb.vue'
import AppFooter from './AppFooter.vue'
import AppNoticeBell from './AppNoticeBell.vue'
import AppSearch from './AppSearch.vue'
import AppShortcutHelp from './AppShortcutHelp.vue'
import AppTabs from './AppTabs.vue'
import LockScreen from './LockScreen.vue'
import UserMenu from './UserMenu.vue'
import { contentFullscreenLabel, shouldClearLayoutOverlays } from './content-fullscreen'
import { excludeCachedName, readViewName, viewInstanceKey } from './view-refresh'
import {
  isIconOnlySidebar,
  isSidebarExpanded,
  sidebarChrome,
  sidebarToggleLabel,
  showsHeaderNav,
  showsSidebarResizer,
  showsSidebarToggle,
} from './sidebar-chrome'
import { useIdleLock } from './use-idle-lock'
import { useNarrowViewport } from './use-narrow'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const preferences = usePreferencesStore()
const tabsStore = useTabsStore()
const lockStore = useLockStore()
const linksStore = useLinksStore()
const { userInfo } = storeToRefs(authStore)
const { locked } = storeToRefs(lockStore)
const { appName, navLayout, sidebarCollapsed, sidebarWidth } = storeToRefs(preferences)
const dragWidth = ref<number | null>(null)
const dragStart = ref<{ startWidth: number; startX: number } | null>(null)
const { cachedNames } = storeToRefs(tabsStore)
const menuGroups = useAccessMenu()
const narrow = useNarrowViewport()
const drawerOpen = ref(false)
const contentFullscreen = ref(false)
const evictedViewName = ref('')
const viewEpoch = ref(0)

useIdleLock()

const chrome = computed(() =>
  sidebarChrome(
    narrow.value,
    sidebarCollapsed.value,
    drawerOpen.value,
    normalizeNavLayout(navLayout.value),
  ),
)
const headerNav = computed(() => showsHeaderNav(chrome.value))
const sidebarToggle = computed(() => showsSidebarToggle(chrome.value))
const asideHidden = computed(
  () => contentFullscreen.value || chrome.value === 'drawer-closed' || chrome.value === 'top',
)
const iconOnly = computed(() => isIconOnlySidebar(chrome.value))
const showTitles = computed(() => isSidebarExpanded(chrome.value))
const toggleLabel = computed(() => sidebarToggleLabel(chrome.value))
const sidebarResizer = computed(() => showsSidebarResizer(chrome.value))
const appliedSidebarWidth = computed(
  () => dragWidth.value ?? normalizeSidebarWidth(sidebarWidth.value),
)
const shellStyle = computed(() =>
  sidebarResizer.value ? { '--sidebar-width': `${appliedSidebarWidth.value}px` } : undefined,
)

function setResizingClass(on: boolean) {
  document.documentElement.classList.toggle('sidebar-resizing', on)
}

function onResizeStart(event: PointerEvent) {
  if (event.button !== 0 || !sidebarResizer.value) return
  event.preventDefault()
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  const startWidth = normalizeSidebarWidth(sidebarWidth.value)
  dragStart.value = { startWidth, startX: event.clientX }
  dragWidth.value = startWidth
  setResizingClass(true)
}

function onResizeMove(event: PointerEvent) {
  if (!dragStart.value) return
  dragWidth.value = sidebarWidthFromDrag(
    dragStart.value.startWidth,
    dragStart.value.startX,
    event.clientX,
  )
}

function onResizeEnd() {
  if (dragWidth.value !== null) {
    preferences.setSidebarWidth(dragWidth.value)
  }
  dragStart.value = null
  dragWidth.value = null
  setResizingClass(false)
}

function onResizeKey(event: KeyboardEvent) {
  const next = sidebarWidthByKey(appliedSidebarWidth.value, event.key)
  if (next === null) return
  event.preventDefault()
  preferences.setSidebarWidth(next)
}

const pageTitle = computed(() => {
  if (route.name === 'embed-link') {
    const code = typeof route.params.code === 'string' ? route.params.code : ''
    return linksStore.titleFor(code) || route.meta.title || appName.value
  }
  return route.meta.title ?? appName.value
})
const keepAliveInclude = computed(() =>
  excludeCachedName(cachedNames.value, evictedViewName.value),
)
const viewKey = computed(() => viewInstanceKey(route.name, viewEpoch.value))

const allowedTabNames = computed(() => {
  const names = new Set<string>(staticLayoutNames())
  for (const group of menuGroups.value) {
    for (const item of group.items) {
      names.add(item.name)
    }
  }
  for (const name of extraTabNames(menuGroups.value.flatMap((group) => group.items))) {
    names.add(name)
  }
  return [...names]
})

watch(
  () =>
    [
      route.fullPath,
      route.name,
      userInfo.value?.username,
      allowedTabNames.value.join(','),
      pageTitle.value,
    ] as const,
  () => {
    if (userInfo.value?.username) {
      tabsStore.syncOwner(userInfo.value.username)
    }
    tabsStore.prune(allowedTabNames.value)
    tabsStore.openFromRoute({
      fullPath: route.fullPath,
      meta: { ...route.meta, title: pageTitle.value },
      name: route.name,
    })
  },
  { immediate: true },
)

watch(
  () => route.fullPath,
  () => {
    drawerOpen.value = false
  },
)

watch(narrow, (isNarrow) => {
  if (!isNarrow) drawerOpen.value = false
})

watch(
  () => route.name,
  () => {
    evictedViewName.value = ''
  },
)

watch(
  () => userInfo.value?.username,
  (name) => {
    if (name) {
      lockStore.syncOwner(name)
      void linksStore.pull()
    } else {
      linksStore.reset()
    }
  },
  { immediate: true },
)

watch(locked, (isLocked) => {
  if (!isLocked) return
  drawerOpen.value = false
  contentFullscreen.value = false
})

watch(sidebarResizer, (canResize) => {
  if (!canResize && dragStart.value) onResizeEnd()
})

function onToggleSidebar() {
  if (narrow.value) {
    drawerOpen.value = !drawerOpen.value
    return
  }
  preferences.toggleSidebar()
}

function enterContentFullscreen() {
  drawerOpen.value = false
  contentFullscreen.value = true
}

function exitContentFullscreen() {
  contentFullscreen.value = false
}

async function refreshCurrentView() {
  evictedViewName.value = readViewName(route.meta)
  viewEpoch.value += 1
  await nextTick()
  evictedViewName.value = ''
}

function onEscape(event: KeyboardEvent) {
  if (!shouldClearLayoutOverlays(event, locked.value)) return
  drawerOpen.value = false
  contentFullscreen.value = false
}

onMounted(() => {
  window.addEventListener('keydown', onEscape)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onEscape)
  setResizingClass(false)
})

function onLock() {
  drawerOpen.value = false
  lockStore.lock()
}

async function onLogout() {
  await authStore.logout()
  await leaveSessionView(router)
}
</script>

<template>
  <div
    class="shell"
    :class="[chrome, { 'content-full': contentFullscreen, resizing: dragStart }]"
    :style="shellStyle"
    :inert="locked"
  >
    <div
      v-if="chrome === 'drawer-open'"
      class="backdrop"
      @click="drawerOpen = false"
    />
    <aside id="app-sidebar" :aria-hidden="asideHidden" :inert="asideHidden">
      <div class="brand">{{ iconOnly ? appName.charAt(0) : appName }}</div>
      <nav>
        <div v-for="group in menuGroups" :key="group.key" class="group">
          <p v-if="group.title && showTitles">{{ group.title }}</p>
          <RouterLink
            v-for="item in group.items"
            :key="item.path || item.name"
            :to="menuItemTo(item)"
            :title="item.title"
          >
            <component
              v-if="resolveMenuIcon(item.icon)"
              :is="resolveMenuIcon(item.icon)"
              class="menu-icon"
            />
            <span v-else-if="iconOnly">{{ item.title.slice(0, 1) }}</span>
            <span v-if="showTitles">{{ item.title }}</span>
          </RouterLink>
        </div>
      </nav>
      <div
        v-if="sidebarResizer"
        class="sidebar-resizer"
        role="separator"
        tabindex="0"
        aria-label="调整侧栏宽度"
        aria-orientation="vertical"
        :aria-valuenow="appliedSidebarWidth"
        :aria-valuemin="SIDEBAR_WIDTH_MIN"
        :aria-valuemax="SIDEBAR_WIDTH_MAX"
        title="拖动调整侧栏宽度，双击恢复 220"
        @pointerdown="onResizeStart"
        @pointermove="onResizeMove"
        @pointerup="onResizeEnd"
        @pointercancel="onResizeEnd"
        @dblclick="preferences.resetSidebarWidth()"
        @keydown="onResizeKey"
      />
    </aside>

    <div class="main">
      <header>
        <button
          v-if="sidebarToggle"
          type="button"
          :aria-expanded="isSidebarExpanded(chrome)"
          aria-controls="app-sidebar"
          @click="onToggleSidebar"
        >
          {{ toggleLabel }}
        </button>
        <span v-if="headerNav" class="header-brand">{{ appName }}</span>
        <nav v-if="headerNav" class="header-nav" aria-label="主导航">
          <div v-for="group in menuGroups" :key="group.key" class="group">
            <p v-if="group.title">{{ group.title }}</p>
            <RouterLink
              v-for="item in group.items"
              :key="item.path || item.name"
              :to="menuItemTo(item)"
              :title="item.title"
            >
              <component
                v-if="resolveMenuIcon(item.icon)"
                :is="resolveMenuIcon(item.icon)"
                class="menu-icon"
              />
              <span>{{ item.title }}</span>
            </RouterLink>
          </div>
        </nav>
        <h1>{{ pageTitle }}</h1>
        <div class="user">
          <AppSearch />
          <AppNoticeBell />
          <AppShortcutHelp />
          <button type="button" title="重挂当前页，不是浏览器刷新" @click="refreshCurrentView">
            刷新
          </button>
          <button type="button" :title="contentFullscreenLabel(false)" @click="enterContentFullscreen">
            {{ contentFullscreenLabel(false) }}
          </button>
          <AppearanceMenu />
          <UserMenu @lock="onLock" @logout="onLogout" />
        </div>
      </header>
      <AppTabs />
      <AppBreadcrumb />
      <section>
        <RouterView v-slot="{ Component }">
          <KeepAlive :include="keepAliveInclude">
            <component :is="Component" :key="viewKey" />
          </KeepAlive>
        </RouterView>
      </section>
      <AppFooter />
    </div>
  </div>
  <div v-if="contentFullscreen && !locked" class="full-actions">
    <button type="button" title="重挂当前页，不是浏览器刷新" @click="refreshCurrentView">
      刷新
    </button>
    <button type="button" @click="exitContentFullscreen">
      {{ contentFullscreenLabel(true) }}
    </button>
  </div>
  <LockScreen v-if="locked" @logout="onLogout" />
</template>

<style scoped>
.shell {
  --sidebar-width: 220px;
  display: grid;
  grid-template-columns: var(--sidebar-width) 1fr;
  min-height: 100vh;
}

.shell.docked-collapsed {
  --sidebar-width: 4.25rem;
}

.shell.drawer-closed,
.shell.drawer-open,
.shell.top {
  grid-template-columns: 1fr;
}

.shell.top aside {
  display: none;
}

aside {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border-right: 1px solid var(--color-border);
  background: var(--color-background-soft);
  padding: var(--chrome-aside-pad);
}

.sidebar-resizer {
  position: absolute;
  top: 0;
  right: -3px;
  z-index: 2;
  width: 6px;
  height: 100%;
  cursor: col-resize;
}

.sidebar-resizer:hover,
.shell.resizing .sidebar-resizer {
  background: var(--color-border);
}

.brand {
  padding: 0 0.5rem;
  font-weight: 650;
  color: var(--color-heading);
}

aside nav {
  display: grid;
  gap: 0.85rem;
}

.header-brand {
  flex: 0 0 auto;
  font-weight: 650;
  color: var(--color-heading);
}

.header-nav {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.45rem 1rem;
  flex: 1;
  min-width: 0;
}

.group {
  display: grid;
  gap: 0.25rem;
}

.group p {
  margin: 0 0.5rem;
  font-size: 0.72rem;
  letter-spacing: 0.04em;
  opacity: 0.55;
}

aside nav a,
.header-nav a {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 0.4rem;
  padding: var(--chrome-nav-pad);
  color: var(--color-text);
}

.header-nav .group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.15rem;
}

.header-nav .group p {
  margin: 0 0.35rem 0 0;
}

.shell.docked-collapsed nav a {
  justify-content: center;
}

.shell.drawer-closed aside,
.shell.drawer-open aside {
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 20;
  width: min(220px, 85vw);
  transition: transform 0.2s ease;
}

.shell.drawer-closed aside {
  transform: translateX(-100%);
}

.backdrop {
  position: fixed;
  inset: 0;
  z-index: 15;
  background: rgb(0 0 0 / 35%);
}

.shell.drawer-closed :deep(.user-label),
.shell.drawer-open :deep(.user-label) {
  display: none;
}

.menu-icon {
  flex: 0 0 auto;
  font-size: 1.05rem;
}

aside nav a.router-link-exact-active,
.header-nav a.router-link-exact-active {
  background: var(--color-background-mute);
  color: var(--color-heading);
  font-weight: 600;
}

.shell.top header h1 {
  flex: 0 1 auto;
  max-width: 12rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.main {
  display: grid;
  grid-template-rows: var(--chrome-header-height) auto auto 1fr auto;
  min-width: 0;
}

header {
  display: flex;
  align-items: center;
  gap: 1rem;
  border-bottom: 1px solid var(--color-border);
  padding: 0 1.25rem;
}

h1 {
  flex: 1;
  font-size: 1rem;
  font-weight: 650;
  color: var(--color-heading);
}

.user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
}

button {
  border: 1px solid var(--color-border);
  border-radius: 0.4rem;
  background: var(--color-background);
  color: var(--color-text);
  padding: var(--chrome-btn-pad);
  font: inherit;
  cursor: pointer;
}

section {
  min-width: 0;
  padding: var(--chrome-section-pad);
}

.shell.content-full {
  grid-template-columns: 1fr;
}

.shell.content-full aside,
.shell.content-full .backdrop,
.shell.content-full header,
.shell.content-full :deep(.tabs),
.shell.content-full :deep(.crumbs),
.shell.content-full :deep(.footer) {
  display: none;
}

.shell.content-full .main {
  grid-template-rows: 1fr;
}

.full-actions {
  position: fixed;
  top: 0.75rem;
  right: 0.75rem;
  z-index: 10;
  display: flex;
  gap: 0.4rem;
}

.full-actions button {
  border: 1px solid var(--color-border);
  border-radius: 0.4rem;
  background: var(--color-background);
  color: var(--color-text);
  padding: var(--chrome-btn-pad);
  font: inherit;
  cursor: pointer;
}
</style>
