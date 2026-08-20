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

/** 搜索可以找到 hideInMenu 的页（个人中心），仍要过权限 */
export function canSearchRoute(route: RouteRecordRaw, viewer: AccessViewer) {
  if (!route.meta?.title) {
    return false
  }
  return canAccessRoute(route, viewer)
}

function toItem(route: RouteRecordRaw): AccessMenuItem {
  return {
    group: route.meta?.group,
    icon: route.meta?.icon,
    name: String(route.name),
    order: route.meta?.order ?? 0,
    title: route.meta?.title ?? String(route.name),
  }
}

export function toMenuItems(routes: RouteRecordRaw[], viewer: AccessViewer): AccessMenuItem[] {
  return routes
    .filter((route) => canSeeRoute(route, viewer))
    .map(toItem)
    .sort((a, b) => a.order - b.order)
}

export function toSearchItems(routes: RouteRecordRaw[], viewer: AccessViewer): AccessMenuItem[] {
  return routes
    .filter((route) => canSearchRoute(route, viewer))
    .map(toItem)
    .sort((a, b) => a.order - b.order)
}

export function filterSearchItems(items: AccessMenuItem[], keyword: string): AccessMenuItem[] {
  const query = keyword.trim().toLowerCase()
  if (!query) return items
  return items.filter((item) => {
    const group = item.group?.toLowerCase() ?? ''
    return (
      item.title.toLowerCase().includes(query) ||
      item.name.toLowerCase().includes(query) ||
      group.includes(query)
    )
  })
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

function currentViewer(): AccessViewer {
  const authStore = useAuthStore()
  return {
    menuCodes: authStore.userInfo?.menuCodes ?? [],
    roles: authStore.userInfo?.roles ?? [],
  }
}

export function useAccessMenu() {
  return computed(() => groupMenuItems(toMenuItems(layoutChildren, currentViewer())))
}

export function useSearchItems() {
  return computed(() => toSearchItems(layoutChildren, currentViewer()))
}
