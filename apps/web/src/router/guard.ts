import type { LocationQuery, RouteMeta, Router } from 'vue-router'

import { canAccessRoute, filterDynamicRoutes } from '@/access/resolve'
import { HOME_PATH, LOGIN_PATH } from '@/constants/auth'
import { useAuthStore } from '@/stores/auth'
import type { UserInfo } from '@/types/user'

import { applyAccessRoutes, matchLayoutChild, resetAccessRoutes } from './dynamic-access'
import { dynamicLayoutChildren } from './routes'

export function redirectQuery(fullPath: string) {
  return fullPath === HOME_PATH ? {} : { redirect: fullPath }
}

export type RouteAccessInput = {
  fullPath: string
  meta: RouteMeta
  path: string
  query: LocationQuery
}

export type AccessContext = {
  accessToken: string
  applyAccessRoutes: (routes: ReturnType<typeof filterDynamicRoutes>) => void
  clearSession: () => void
  fetchUserInfo: () => Promise<UserInfo>
  invalidateAccess: () => void
  isAccessGenerated: boolean
  markAccessGenerated: () => void
  resetAccessRoutes: () => void
  userInfo: UserInfo | null
}

export function resolveAccessTarget(to: RouteAccessInput): RouteAccessInput {
  const catalogRoute = matchLayoutChild(to.path)
  if (catalogRoute) {
    return { ...to, meta: catalogRoute.meta ?? {} }
  }
  return to
}

export async function decideAccess(
  to: RouteAccessInput,
  ctx: AccessContext,
) {
  const target = resolveAccessTarget(to)

  if (target.meta.public) {
    if (target.path === LOGIN_PATH && ctx.accessToken) {
      const redirect = target.query.redirect
      return typeof redirect === 'string' ? redirect : HOME_PATH
    }
    return true
  }

  if (!ctx.accessToken) {
    if (ctx.isAccessGenerated) {
      ctx.resetAccessRoutes()
      ctx.invalidateAccess()
    }
    return {
      path: LOGIN_PATH,
      query: redirectQuery(target.fullPath),
      replace: true,
    }
  }

  let userInfo = ctx.userInfo
  if (!userInfo) {
    try {
      userInfo = await ctx.fetchUserInfo()
    } catch {
      ctx.clearSession()
      ctx.resetAccessRoutes()
      ctx.invalidateAccess()
      return {
        path: LOGIN_PATH,
        query: redirectQuery(target.fullPath),
        replace: true,
      }
    }
  }

  let generatedNow = false
  if (!ctx.isAccessGenerated) {
    ctx.applyAccessRoutes(filterDynamicRoutes(dynamicLayoutChildren, userInfo))
    ctx.markAccessGenerated()
    generatedNow = true
  }

  if (!canAccessRoute({ meta: target.meta }, userInfo)) {
    return { name: 'forbidden', replace: true }
  }

  if (generatedNow) {
    return { path: target.path, query: target.query, replace: true }
  }

  return true
}

export function setupAccessGuard(router: Router) {
  router.beforeEach(async (to) => {
    const authStore = useAuthStore()
    return decideAccess(
      {
        fullPath: to.fullPath,
        meta: to.meta,
        path: to.path,
        query: to.query,
      },
      {
        accessToken: authStore.accessToken,
        applyAccessRoutes: (routes) => {
          applyAccessRoutes(router, routes)
        },
        clearSession: () => {
          authStore.clearSession()
        },
        fetchUserInfo: () => authStore.fetchUserInfo(),
        invalidateAccess: () => {
          authStore.invalidateAccess()
        },
        isAccessGenerated: authStore.isAccessGenerated,
        markAccessGenerated: () => {
          authStore.markAccessGenerated()
        },
        resetAccessRoutes: () => {
          resetAccessRoutes(router)
        },
        userInfo: authStore.userInfo,
      },
    )
  })
}
