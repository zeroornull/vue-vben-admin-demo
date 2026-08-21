import { createRequestClient } from '@app/request'

import { LOGIN_PATH } from '@/constants/auth'
import { useAuthStore } from '@/stores/auth'
import { useRequestStore } from '@/stores/request'

export { unwrapBody, type ApiBody } from '@app/request'

async function handleUnauthorized() {
  const authStore = useAuthStore()
  const currentPath = window.location.pathname + window.location.search
  authStore.clearSession()
  if (window.location.pathname === LOGIN_PATH) {
    return
  }
  const { default: router } = await import('@/router')
  await router.replace({
    path: LOGIN_PATH,
    query: currentPath === '/' ? {} : { redirect: currentPath },
  })
}

const api = createRequestClient({
  announceError: (text) => useRequestStore().fail(text),
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  beginLoading: () => useRequestStore().begin(),
  endLoading: () => useRequestStore().end(),
  getAccessToken: () => useAuthStore().accessToken,
  onUnauthorized: handleUnauthorized,
})

export const requestClient = api.requestClient
export const get = api.get
export const post = api.post
export const put = api.put
export const del = api.del
