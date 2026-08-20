import axios, { type AxiosError, type AxiosRequestConfig } from 'axios'

import { LOGIN_PATH } from '@/constants/auth'
import { useAuthStore } from '@/stores/auth'
import { useRequestStore } from '@/stores/request'

import { shouldTrackLoading } from './pending'
import { retryCountOf, shouldRetryRequest } from './retry'
import { errorToastText, requestError, shouldAnnounceError } from './toast'

export type ApiBody<T> = {
  code: number
  data: T
  message: string
}

export function unwrapBody<T>(body: ApiBody<T>): T {
  if (body.code !== 0) {
    throw new Error(body.message || '请求失败')
  }
  return body.data
}

export const requestClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  timeout: 10_000,
})

function finishLoading(config: AxiosRequestConfig | undefined) {
  if (!config || !shouldTrackLoading(config)) return
  useRequestStore().end()
}

requestClient.interceptors.request.use((config) => {
  const token = useAuthStore().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  if (shouldTrackLoading(config) && retryCountOf(config) === 0) {
    useRequestStore().begin()
  }
  return config
})

requestClient.interceptors.response.use(
  (response) => {
    finishLoading(response.config)
    const body = response.data as ApiBody<unknown>
    if (body.code === 401) {
      void handleUnauthorized()
    }
    return response
  },
  (error: AxiosError<ApiBody<unknown>>) => {
    const config = error.config
    const status = error.response?.status
    const unauthorized = status === 401
    if (unauthorized) {
      void handleUnauthorized()
    }
    if (
      config &&
      shouldRetryRequest({
        code: error.code,
        method: config.method,
        retryCount: config.retryCount,
        skipRetry: config.skipRetry,
        status,
      })
    ) {
      config.retryCount = retryCountOf(config) + 1
      return requestClient.request(config)
    }
    finishLoading(config)
    const message =
      error.response?.data?.message || error.message || '网络错误'
    return Promise.reject(requestError(message, unauthorized))
  },
)

async function unwrap<T>(
  request: Promise<{ data: ApiBody<T> }>,
  config?: AxiosRequestConfig,
): Promise<T> {
  try {
    const { data: body } = await request
    if (body.code === 401) {
      throw requestError(body.message || '未登录或登录已过期', true)
    }
    return unwrapBody(body)
  } catch (error) {
    if (shouldAnnounceError(error, config)) {
      useRequestStore().fail(errorToastText(error))
    }
    throw error
  }
}

export function get<T>(url: string, config?: AxiosRequestConfig) {
  return unwrap(requestClient.get<ApiBody<T>>(url, config), config)
}

export function post<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
  return unwrap(requestClient.post<ApiBody<T>>(url, data, config), config)
}

export function put<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
  return unwrap(requestClient.put<ApiBody<T>>(url, data, config), config)
}

export function del<T>(url: string, config?: AxiosRequestConfig) {
  return unwrap(requestClient.delete<ApiBody<T>>(url, config), config)
}

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
