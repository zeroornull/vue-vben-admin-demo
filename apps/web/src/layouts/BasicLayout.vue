<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

import ThemeToggle from '@/components/ThemeToggle.vue'
import { LOGIN_PATH } from '@/constants/auth'
import { resolveMenuIcon } from '@/icons/menu-icons'
import { useAccessMenu } from '@/router/access-menu'
import { staticLayoutNames } from '@/router/routes'
import { resetAccessRoutes } from '@/router/dynamic-access'
import { useAuthStore } from '@/stores/auth'
import { useLockStore } from '@/stores/lock'
import { usePreferencesStore } from '@/stores/preferences'
import { useTabsStore } from '@/stores/tabs'

import AppBreadcrumb from './AppBreadcrumb.vue'
import AppSearch from './AppSearch.vue'
import AppTabs from './AppTabs.vue'
import LockScreen from './LockScreen.vue'
import UserMenu from './UserMenu.vue'
import {
  isIconOnlySidebar,
  isSidebarExpanded,
  sidebarChrome,
  sidebarToggleLabel,
} from './sidebar-chrome'
import { useNarrowViewport } from './use-narrow'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const preferences = usePreferencesStore()
const tabsStore = useTabsStore()
const lockStore = useLockStore()
const { userInfo } = storeToRefs(authStore)
const { locked } = storeToRefs(lockStore)
const { appName, sidebarCollapsed } = storeToRefs(preferences)
const { cachedNames } = storeToRefs(tabsStore)
const menuGroups = useAccessMenu()
const narrow = useNarrowViewport()
const drawerOpen = ref(false)

const chrome = computed(() =>
  sidebarChrome(narrow.value, sidebarCollapsed.value, drawerOpen.value),
)
const iconOnly = computed(() => isIconOnlySidebar(chrome.value))
const showTitles = computed(() => isSidebarExpanded(chrome.value))
const toggleLabel = computed(() => sidebarToggleLabel(chrome.value))

const pageTitle = computed(() => route.meta.title ?? appName.value)

const allowedTabNames = computed(() => {
  const names = new Set<string>(staticLayoutNames())
  for (const group of menuGroups.value) {
    for (const item of group.items) {
      names.add(item.name)
    }
  }
  return [...names]
})

watch(
  () => [route.fullPath, route.name, userInfo.value?.username, allowedTabNames.value.join(',')] as const,
  () => {
    if (userInfo.value?.username) {
      tabsStore.syncOwner(userInfo.value.username)
    }
    tabsStore.prune(allowedTabNames.value)
    tabsStore.openFromRoute(route)
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
  () => userInfo.value?.username,
  (name) => {
    if (name) lockStore.syncOwner(name)
  },
  { immediate: true },
)

function onToggleSidebar() {
  if (narrow.value) {
    drawerOpen.value = !drawerOpen.value
    return
  }
  preferences.toggleSidebar()
}

function onEscape(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    drawerOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('keydown', onEscape)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onEscape)
})

function onLock() {
  drawerOpen.value = false
  lockStore.lock()
}

async function onLogout() {
  await authStore.logout()
  tabsStore.reset()
  resetAccessRoutes(router)
  await router.replace(LOGIN_PATH)
}
</script>

<template>
  <div class="shell" :class="chrome" :inert="locked">
    <div
      v-if="chrome === 'drawer-open'"
      class="backdrop"
      @click="drawerOpen = false"
    />
    <aside
      id="app-sidebar"
      :aria-hidden="chrome === 'drawer-closed'"
      :inert="chrome === 'drawer-closed'"
    >
      <div class="brand">{{ iconOnly ? appName.charAt(0) : appName }}</div>
      <nav>
        <div v-for="group in menuGroups" :key="group.key" class="group">
          <p v-if="group.title && showTitles">{{ group.title }}</p>
          <RouterLink
            v-for="item in group.items"
            :key="item.name"
            :to="{ name: item.name }"
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
    </aside>

    <div class="main">
      <header>
        <button
          type="button"
          :aria-expanded="isSidebarExpanded(chrome)"
          aria-controls="app-sidebar"
          @click="onToggleSidebar"
        >
          {{ toggleLabel }}
        </button>
        <h1>{{ pageTitle }}</h1>
        <div class="user">
          <AppSearch />
          <ThemeToggle />
          <UserMenu @lock="onLock" @logout="onLogout" />
        </div>
      </header>
      <AppTabs />
      <AppBreadcrumb />
      <section>
        <RouterView v-slot="{ Component }">
          <KeepAlive :include="cachedNames">
            <component :is="Component" :key="String(route.name)" />
          </KeepAlive>
        </RouterView>
      </section>
    </div>
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
.shell.drawer-open {
  grid-template-columns: 1fr;
}

aside {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border-right: 1px solid var(--color-border);
  background: var(--color-background-soft);
  padding: 1rem 0.75rem;
}

.brand {
  padding: 0 0.5rem;
  font-weight: 650;
  color: var(--color-heading);
}

nav {
  display: grid;
  gap: 0.85rem;
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

nav a {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 0.4rem;
  padding: 0.45rem 0.6rem;
  color: var(--color-text);
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

nav a.router-link-exact-active {
  background: var(--color-background-mute);
  color: var(--color-heading);
  font-weight: 600;
}

.main {
  display: grid;
  grid-template-rows: 3.5rem auto auto 1fr;
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
  padding: 0.3rem 0.65rem;
  font: inherit;
  cursor: pointer;
}

section {
  min-width: 0;
  padding: 1.25rem 1.5rem 2rem;
}
</style>
