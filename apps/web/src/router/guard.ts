import type { Router } from 'vue-router'

import { HOME_PATH, LOGIN_PATH } from '@/constants/auth'
import { useAuthStore } from '@/stores/auth'

function redirectQuery(fullPath: string) {
  return fullPath === HOME_PATH ? {} : { redirect: fullPath }
}

export function setupAccessGuard(router: Router) {
  router.beforeEach(async (to) => {
    const authStore = useAuthStore()

    if (to.meta.public) {
      if (to.path === LOGIN_PATH && authStore.accessToken) {
        const redirect = to.query.redirect
        return typeof redirect === 'string' ? redirect : HOME_PATH
      }
      return true
    }

    if (!authStore.accessToken) {
      return {
        path: LOGIN_PATH,
        query: redirectQuery(to.fullPath),
        replace: true,
      }
    }

    if (!authStore.userInfo) {
      try {
        await authStore.fetchUserInfo()
      } catch {
        authStore.clearSession()
        return {
          path: LOGIN_PATH,
          query: redirectQuery(to.fullPath),
          replace: true,
        }
      }
    }

    const requiredRoles = to.meta.roles
    const userRoles = authStore.userInfo?.roles ?? []
    if (
      requiredRoles?.length &&
      !requiredRoles.some((role) => userRoles.includes(role))
    ) {
      return { name: 'forbidden', replace: true }
    }

    return true
  })
}
