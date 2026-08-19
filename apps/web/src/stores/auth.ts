import { ref } from 'vue'
import { defineStore } from 'pinia'

import { getUserInfoApi, loginApi, logoutApi, type LoginParams } from '@/api'
import type { UserInfo } from '@/types/user'

export const useAuthStore = defineStore(
  'auth',
  () => {
    const accessToken = ref('')
    const userInfo = ref<UserInfo | null>(null)
    const loginLoading = ref(false)

    async function login(params: LoginParams) {
      loginLoading.value = true
      try {
        const { accessToken: token } = await loginApi(params)
        accessToken.value = token
        userInfo.value = await getUserInfoApi()
        return userInfo.value
      } finally {
        loginLoading.value = false
      }
    }

    async function fetchUserInfo() {
      userInfo.value = await getUserInfoApi()
      return userInfo.value
    }

    async function logout() {
      try {
        await logoutApi()
      } catch {
        // 退出接口失败也清本地会话
      }
      clearSession()
    }

    function clearSession() {
      accessToken.value = ''
      userInfo.value = null
    }

    return {
      accessToken,
      clearSession,
      fetchUserInfo,
      login,
      loginLoading,
      logout,
      userInfo,
    }
  },
  {
    persist: {
      pick: ['accessToken'],
    },
  },
)
