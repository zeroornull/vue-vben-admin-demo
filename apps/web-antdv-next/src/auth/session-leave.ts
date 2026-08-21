import type { Router } from 'vue-router'

import { LOGIN_PATH } from '@/constants/auth'
import { resetAccessRoutes } from '@/router/dynamic-access'
import { useLinksStore } from '@/stores/links'
import { useNoticesStore } from '@/stores/notices'
import { useTabsStore } from '@/stores/tabs'

export function resetSessionStores() {
  useTabsStore().reset()
  useNoticesStore().reset()
  useLinksStore().reset()
}

export async function leaveSessionView(router: Router) {
  resetSessionStores()
  resetAccessRoutes(router)
  if (router.currentRoute.value.path === LOGIN_PATH) return
  await router.replace({ path: LOGIN_PATH })
}
