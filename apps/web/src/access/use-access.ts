import { computed } from 'vue'

import { useAuthStore } from '@/stores/auth'

import { hasAccessCode } from './resolve'

export function useAccess() {
  const authStore = useAuthStore()
  const actionCodes = computed(() => authStore.userInfo?.actionCodes ?? [])

  function hasAction(code: string) {
    return hasAccessCode(actionCodes.value, code)
  }

  return { actionCodes, hasAction }
}
