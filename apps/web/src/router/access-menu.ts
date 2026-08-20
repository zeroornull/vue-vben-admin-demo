import type { RouteRecordRaw } from 'vue-router'
import { computed } from 'vue'

import { canAccessRoute, type AccessViewer } from '@/access/resolve'
import { useAuthStore } from '@/stores/auth'

import { layoutChildren } from './routes'

export type AccessMenuItem = {
  group?: string
  icon?: string
  name: string
  order: number
  title: string
}

export type AccessMenuGroup = {
  items: AccessMenuItem[]
  key: string
  title: string | null
}

export function canSeeRoute(route: RouteRecordRaw, viewer: AccessViewer) {
  if (!route.meta?.title || route.meta.hideInMenu) {
    return false
  }
  return canAccessRoute(route, viewer)
}

export function toMenuItems(routes: RouteRecordRaw[], viewer: AccessViewer): AccessMenuItem[] {
  return routes
    .filter((route) => canSeeRoute(route, viewer))
    .map((route) => ({
      group: route.meta?.group,
      icon: route.meta?.icon,
      name: String(route.name),
      order: route.meta?.order ?? 0,
      title: route.meta?.title ?? String(route.name),
    }))
    .sort((a, b) => a.order - b.order)
}

export function groupMenuItems(items: AccessMenuItem[]): AccessMenuGroup[] {
  const groups: AccessMenuGroup[] = []
  for (const item of items) {
    const key = item.group ?? ''
    const current = groups.at(-1)
    if (current && current.key === key) {
      current.items.push(item)
      continue
    }
    groups.push({ items: [item], key, title: item.group ?? null })
  }
  return groups
}

export function useAccessMenu() {
  const authStore = useAuthStore()

  return computed(() => {
    const viewer: AccessViewer = {
      menuCodes: authStore.userInfo?.menuCodes ?? [],
      roles: authStore.userInfo?.roles ?? [],
    }
    return groupMenuItems(toMenuItems(layoutChildren, viewer))
  })
}
