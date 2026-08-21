import { ref } from 'vue'
import { defineStore } from 'pinia'

import {
  changePasswordApi,
  getUserInfoApi,
  loginApi,
  logoutApi,
  updateProfileApi,
  type ChangePasswordParams,
  type LoginParams,
} from '@/api'
import {
  publishSessionClear,
  publishSessionMessage,
  SESSION_ADOPT_TYPE,
  shouldPublishSessionClear,
} from '@/auth/session-broadcast'
import { useLockStore } from '@/stores/lock'
import type { UserInfo } from '@/types/user'

export const useAuthStore = defineStore(
  'auth',
  () => {
    const accessToken = ref('')
    const userInfo = ref<UserInfo | null>(null)
    const loginLoading = ref(false)
    const isAccessGenerated = ref(false)

    function markAccessGenerated() {
      isAccessGenerated.value = true
    }

    function invalidateAccess() {
      isAccessGenerated.value = false
    }

    async function login(params: LoginParams) {
      loginLoading.value = true
      try {
        const { accessToken: token } = await loginApi(params)
        accessToken.value = token
        userInfo.value = await getUserInfoApi()
        invalidateAccess()
        useLockStore().reset()
        publishSessionMessage({ type: SESSION_ADOPT_TYPE })
        return userInfo.value
      } finally {
        loginLoading.value = false
      }
    }

    async function fetchUserInfo() {
      userInfo.value = await getUserInfoApi()
      return userInfo.value
    }

    async function updateProfile(realName: string) {
      userInfo.value = await updateProfileApi({ realName })
      return userInfo.value
    }

    async function changePassword(params: ChangePasswordParams) {
      await changePasswordApi(params)
    }

    async function logout() {
      try {
        await logoutApi()
      } catch {
        // 退出接口失败也清本地会话
      }
      clearSession()
    }

    function clearSession(options?: { broadcast?: boolean }) {
      const hadToken = Boolean(accessToken.value)
      accessToken.value = ''
      userInfo.value = null
      invalidateAccess()
      useLockStore().reset()
      if (shouldPublishSessionClear(hadToken, options)) {
        publishSessionClear()
      }
    }

    return {
      accessToken,
      changePassword,
      clearSession,
      fetchUserInfo,
      invalidateAccess,
      isAccessGenerated,
      login,
      loginLoading,
      logout,
      updateProfile,
      markAccessGenerated,
      userInfo,
    }
  },
  {
    persist: {
      pick: ['accessToken'],
    },
  },
)
