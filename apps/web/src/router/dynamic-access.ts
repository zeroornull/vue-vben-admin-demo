import type { RouteRecordRaw, Router } from 'vue-router'

import { filterDynamicRoutes } from '@/access/resolve'
import { useAuthStore } from '@/stores/auth'

import { dynamicLayoutChildren, layoutChildren } from './routes'

const addedNames: string[] = []

export function resetAccessRoutes(router: Router) {
  for (const name of addedNames) {
    if (router.hasRoute(name)) {
      router.removeRoute(name)
    }
  }
  addedNames.length = 0
}

export function applyAccessRoutes(router: Router, routes: RouteRecordRaw[]) {
  resetAccessRoutes(router)
  for (const route of routes) {
    const name = route.name
    if (typeof name !== 'string') continue
    router.addRoute('root', route)
    addedNames.push(name)
  }
}

/** 按当前 userInfo 重挂动态子路由；角色菜单改完后侧栏要马上变 */
export function syncAccessRoutes(router: Router) {
  const authStore = useAuthStore()
  const userInfo = authStore.userInfo
  if (!userInfo) {
    resetAccessRoutes(router)
    authStore.invalidateAccess()
    return
  }
  applyAccessRoutes(router, filterDynamicRoutes(dynamicLayoutChildren, userInfo))
  authStore.markAccessGenerated()
}

export function matchRoutePath(pattern: string, childPath: string): boolean {
  if (pattern === childPath) return true
  if (!pattern.includes(':')) return false
  const expected = pattern.split('/')
  const actual = childPath.split('/')
  if (expected.length !== actual.length) return false
  return expected.every((part, index) => part.startsWith(':') || part === actual[index])
}

export function matchLayoutChild(path: string): RouteRecordRaw | undefined {
  const clean = path.split('?')[0]?.replace(/\/+$/, '') || '/'
  const childPath = clean === '/' ? '' : clean.slice(1)
  return layoutChildren.find((route) => matchRoutePath(route.path, childPath))
}
