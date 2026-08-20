import { onMounted, onUnmounted } from 'vue'

import { useAuthStore } from '@/stores/auth'

import {
  isSessionClearMessage,
  SESSION_CHANNEL_NAME,
  shouldApplyRemoteSessionClear,
} from './session-broadcast'
import { leaveSessionView } from './session-leave'

export async function applyRemoteSessionClear() {
  const auth = useAuthStore()
  if (!shouldApplyRemoteSessionClear(auth.accessToken)) return
  auth.clearSession({ broadcast: false })
  const { default: router } = await import('@/router')
  await leaveSessionView(router)
}

export function useSessionSync() {
  let channel: BroadcastChannel | null = null

  onMounted(() => {
    if (typeof BroadcastChannel === 'undefined') return
    channel = new BroadcastChannel(SESSION_CHANNEL_NAME)
    channel.onmessage = (event) => {
      if (!isSessionClearMessage(event.data)) return
      void applyRemoteSessionClear()
    }
  })

  onUnmounted(() => {
    channel?.close()
    channel = null
  })
}
