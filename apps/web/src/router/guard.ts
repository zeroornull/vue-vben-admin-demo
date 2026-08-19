import type { LocationQuery, RouteMeta, Router } from 'vue-router'

import { HOME_PATH, LOGIN_PATH } from '@/constants/auth'
import { useAuthStore } from '@/stores/auth'
import type { UserInfo } from '@/types/user'

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
  clearSession: () => void
  fetchUserInfo: () => Promise<UserInfo>
  userInfo: UserInfo | null
}

export async function decideAccess(
  to: RouteAccessInput,
  ctx: AccessContext,
) {
  if (to.meta.public) {
    if (to.path === LOGIN_PATH && ctx.accessToken) {
      const redirect = to.query.redirect
      return typeof redirect === 'string' ? redirect : HOME_PATH
    }
    return true
  }

  if (!ctx.accessToken) {
    return {
      path: LOGIN_PATH,
      query: redirectQuery(to.fullPath),
      replace: true,
    }
  }

  let userInfo = ctx.userInfo
  if (!userInfo) {
    try {
      userInfo = await ctx.fetchUserInfo()
    } catch {
      ctx.clearSession()
      return {
        path: LOGIN_PATH,
        query: redirectQuery(to.fullPath),
        replace: true,
      }
    }
  }

  const requiredRoles = to.meta.roles
  const userRoles = userInfo.roles
  if (
    requiredRoles?.length &&
    !requiredRoles.some((role) => userRoles.includes(role))
  ) {
    return { name: 'forbidden', replace: true }
  }

  return true
}

export function setupAccessGuard(router: Router) {
  router.beforeEach(async (to) => {
    const authStore = useAuthStore()
    return decideAccess(to, {
      accessToken: authStore.accessToken,
      clearSession: () => {
        authStore.clearSession()
      },
      fetchUserInfo: () => authStore.fetchUserInfo(),
      userInfo: authStore.userInfo,
    })
  })
}
