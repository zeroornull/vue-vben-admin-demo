import { ref } from 'vue'
import { defineStore } from 'pinia'

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

    function lock() {
      locked.value = true
    }

    function unlock() {
      locked.value = false
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
