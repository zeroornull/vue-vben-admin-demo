import type { RouteRecordRaw } from 'vue-router'
import { computed } from 'vue'

import { useAuthStore } from '@/stores/auth'

import { layoutChildren } from './routes'

export type AccessMenuItem = {
  name: string
  order: number
  title: string
}

function canSee(route: RouteRecordRaw, roles: string[]) {
  if (!route.meta?.title || route.meta.hideInMenu) {
    return false
  }
  const required = route.meta.roles
  if (!required?.length) {
    return true
  }
  return required.some((role) => roles.includes(role))
}

export function useAccessMenu() {
  const authStore = useAuthStore()

  return computed<AccessMenuItem[]>(() => {
    const roles = authStore.userInfo?.roles ?? []
    return layoutChildren
      .filter((route) => canSee(route, roles))
      .map((route) => ({
        name: String(route.name),
        order: route.meta?.order ?? 0,
        title: route.meta?.title ?? String(route.name),
      }))
      .sort((a, b) => a.order - b.order)
  })
}
