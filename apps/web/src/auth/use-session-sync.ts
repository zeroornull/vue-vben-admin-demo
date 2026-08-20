import { onMounted, onUnmounted } from 'vue'

import { HOME_PATH, LOGIN_PATH } from '@/constants/auth'
import { syncAccessRoutes } from '@/router/dynamic-access'
import { useAuthStore } from '@/stores/auth'
import { useLockStore } from '@/stores/lock'

import {
  AUTH_PERSIST_KEY,
  isSessionMessage,
  readStoredAccessToken,
  SESSION_ADOPT_TYPE,
  SESSION_CLEAR_TYPE,
  SESSION_CHANNEL_NAME,
  SESSION_LOCK_TYPE,
  SESSION_UNLOCK_TYPE,
  shouldAdoptRemoteSession,
  shouldApplyRemoteLock,
  shouldApplyRemoteSessionClear,
  shouldApplyRemoteUnlock,
} from './session-broadcast'
import { leaveSessionView } from './session-leave'

export async function applyRemoteSessionClear() {
  const auth = useAuthStore()
  if (!shouldApplyRemoteSessionClear(auth.accessToken)) return
  auth.clearSession({ broadcast: false })
  const { default: router } = await import('@/router')
  await leaveSessionView(router)
}

export function applyRemoteLock() {
  const lockStore = useLockStore()
  if (!shouldApplyRemoteLock(lockStore.locked)) return
  lockStore.lock({ broadcast: false })
}

export function applyRemoteUnlock() {
  const lockStore = useLockStore()
  if (!shouldApplyRemoteUnlock(lockStore.locked)) return
  lockStore.unlock({ broadcast: false })
}

export async function applyRemoteAdopt() {
  const auth = useAuthStore()
  const persisted = readStoredAccessToken(localStorage.getItem(AUTH_PERSIST_KEY))
  if (!shouldAdoptRemoteSession(auth.accessToken, persisted)) return
  auth.accessToken = persisted
  const { default: router } = await import('@/router')
  try {
    await auth.fetchUserInfo()
  } catch {
    auth.clearSession({ broadcast: false })
    await leaveSessionView(router)
    return
  }
  useLockStore().reset()
  syncAccessRoutes(router)
  const current = router.currentRoute.value
  if (current.path === LOGIN_PATH) {
    await router.replace(HOME_PATH)
    return
  }
  if (typeof current.name === 'string' && current.name !== 'home' && current.name !== 'root' && !router.hasRoute(current.name)) {
    await router.replace(HOME_PATH)
  }
}

export function useSessionSync() {
  let channel: BroadcastChannel | null = null

  onMounted(() => {
    if (typeof BroadcastChannel === 'undefined') return
    channel = new BroadcastChannel(SESSION_CHANNEL_NAME)
    channel.onmessage = (event) => {
      if (!isSessionMessage(event.data)) return
      if (event.data.type === SESSION_CLEAR_TYPE) {
        void applyRemoteSessionClear()
        return
      }
      if (event.data.type === SESSION_LOCK_TYPE) {
        applyRemoteLock()
        return
      }
      if (event.data.type === SESSION_UNLOCK_TYPE) {
        applyRemoteUnlock()
        return
      }
      if (event.data.type === SESSION_ADOPT_TYPE) {
        void applyRemoteAdopt()
      }
    }
  })

  onUnmounted(() => {
    channel?.close()
    channel = null
  })
}
