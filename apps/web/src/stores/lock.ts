import { ref } from 'vue'
import { defineStore } from 'pinia'

import { publishSessionMessage, SESSION_LOCK_TYPE, SESSION_UNLOCK_TYPE } from '@/auth/session-broadcast'

export const useLockStore = defineStore(
  'lock',
  () => {
    const locked = ref(false)
    const owner = ref('')

    function syncOwner(username: string) {
      if (!username) return
      if (owner.value && owner.value !== username) {
        locked.value = false
      }
      owner.value = username
    }

    function lock(options?: { broadcast?: boolean }) {
      locked.value = true
      if (options?.broadcast !== false) {
        publishSessionMessage({ type: SESSION_LOCK_TYPE })
      }
    }

    function unlock(options?: { broadcast?: boolean }) {
      locked.value = false
      if (options?.broadcast !== false) {
        publishSessionMessage({ type: SESSION_UNLOCK_TYPE })
      }
    }

    function reset() {
      locked.value = false
      owner.value = ''
    }

    return { lock, locked, owner, reset, syncOwner, unlock }
  },
  {
    persist: {
      pick: ['locked', 'owner'],
    },
  },
)
