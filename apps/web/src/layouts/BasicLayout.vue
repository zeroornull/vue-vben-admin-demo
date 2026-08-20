<script setup lang="ts">
import { computed, watch } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

import ThemeToggle from '@/components/ThemeToggle.vue'
import { LOGIN_PATH } from '@/constants/auth'
import { useAccessMenu } from '@/router/access-menu'
import { resetAccessRoutes } from '@/router/dynamic-access'
import { useAuthStore } from '@/stores/auth'
import { usePreferencesStore } from '@/stores/preferences'
import { useTabsStore } from '@/stores/tabs'

import AppTabs from './AppTabs.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const preferences = usePreferencesStore()
const tabsStore = useTabsStore()
const { userInfo } = storeToRefs(authStore)
const { appName, sidebarCollapsed } = storeToRefs(preferences)
const { cachedNames } = storeToRefs(tabsStore)
const menuGroups = useAccessMenu()

const pageTitle = computed(() => route.meta.title ?? appName.value)

const allowedTabNames = computed(() => {
  const names = new Set<string>(['home'])
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

async function onLogout() {
  await authStore.logout()
  tabsStore.reset()
  resetAccessRoutes(router)
  await router.replace(LOGIN_PATH)
}
</script>

<template>
  <div class="shell" :class="{ collapsed: sidebarCollapsed }">
    <aside id="app-sidebar">
      <div class="brand">{{ sidebarCollapsed ? appName.charAt(0) : appName }}</div>
      <nav>
        <div v-for="group in menuGroups" :key="group.key" class="group">
          <p v-if="group.title && !sidebarCollapsed">{{ group.title }}</p>
          <RouterLink
            v-for="item in group.items"
            :key="item.name"
            :to="{ name: item.name }"
            :title="item.title"
          >
            {{ sidebarCollapsed ? item.title.slice(0, 1) : item.title }}
          </RouterLink>
        </div>
      </nav>
    </aside>

    <div class="main">
      <header>
        <button
          type="button"
          :aria-expanded="!sidebarCollapsed"
          aria-controls="app-sidebar"
          @click="preferences.toggleSidebar()"
        >
          {{ sidebarCollapsed ? '展开菜单' : '收起菜单' }}
        </button>
        <h1>{{ pageTitle }}</h1>
        <div class="user">
          <ThemeToggle />
          <span>{{ userInfo?.realName }}</span>
          <button type="button" @click="onLogout">退出</button>
        </div>
      </header>
      <AppTabs />
      <section>
        <RouterView v-slot="{ Component }">
          <KeepAlive :include="cachedNames">
            <component :is="Component" :key="String(route.name)" />
          </KeepAlive>
        </RouterView>
      </section>
    </div>
  </div>
</template>

<style scoped>
.shell {
  --sidebar-width: 220px;
  display: grid;
  grid-template-columns: var(--sidebar-width) 1fr;
  min-height: 100vh;
}

.shell.collapsed {
  --sidebar-width: 4.25rem;
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
  border-radius: 0.4rem;
  padding: 0.45rem 0.6rem;
  color: var(--color-text);
}

nav a.router-link-exact-active {
  background: var(--color-background-mute);
  color: var(--color-heading);
  font-weight: 600;
}

.main {
  display: grid;
  grid-template-rows: 3.5rem auto 1fr;
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
