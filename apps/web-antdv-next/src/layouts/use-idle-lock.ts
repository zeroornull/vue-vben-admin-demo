import { onMounted, onUnmounted, watch } from 'vue'
import { storeToRefs } from 'pinia'

import { normalizeIdleLockMinutes, shouldLockOnIdle } from '@/preferences/idle-lock'
import { useLockStore } from '@/stores/lock'
import { usePreferencesStore } from '@/stores/preferences'

export const IDLE_LOCK_TICK_MS = 1000

export function useIdleLock() {
  const preferences = usePreferencesStore()
  const lockStore = useLockStore()
  const { idleLockMinutes } = storeToRefs(preferences)
  const { locked } = storeToRefs(lockStore)

  let lastActivityAt = Date.now()
  let timer = 0

  function bump() {
    lastActivityAt = Date.now()
  }

  function check() {
    if (
      shouldLockOnIdle({
        lastActivityAt,
        locked: locked.value,
        minutes: normalizeIdleLockMinutes(idleLockMinutes.value),
        now: Date.now(),
      })
    ) {
      lockStore.lock()
    }
  }

  watch(idleLockMinutes, () => bump())

  onMounted(() => {
    bump()
    window.addEventListener('pointerdown', bump, { passive: true })
    window.addEventListener('keydown', bump)
    window.addEventListener('wheel', bump, { passive: true })
    timer = window.setInterval(check, IDLE_LOCK_TICK_MS)
  })

  onUnmounted(() => {
    window.removeEventListener('pointerdown', bump)
    window.removeEventListener('keydown', bump)
    window.removeEventListener('wheel', bump)
    window.clearInterval(timer)
  })
}
