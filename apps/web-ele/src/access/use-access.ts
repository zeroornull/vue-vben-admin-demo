import { computed } from 'vue'

import { useAuthStore } from '@/stores/auth'

import { matchAccess } from '@app/access/match'

export function useAccess() {
  const authStore = useAuthStore()
  const actionCodes = computed(() => authStore.userInfo?.actionCodes ?? [])

  function hasAction(code: string) {
    return matchAccess({ arg: 'action', value: code }, authStore.userInfo)
  }

  function hasAnyAction(...codes: string[]) {
    return matchAccess({ arg: 'action', value: codes }, authStore.userInfo)
  }

  return { actionCodes, hasAction, hasAnyAction }
}
