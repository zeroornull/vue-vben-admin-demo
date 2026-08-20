import axios, { type AxiosError, type AxiosRequestConfig } from 'axios'

import { LOGIN_PATH } from '@/constants/auth'
import { useAuthStore } from '@/stores/auth'
import { useRequestStore } from '@/stores/request'

import { shouldTrackLoading } from './pending'

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
  if (shouldTrackLoading(config)) {
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
    finishLoading(error.config)
    if (error.response?.status === 401) {
      void handleUnauthorized()
    }
    const message =
      error.response?.data?.message || error.message || '网络错误'
    return Promise.reject(new Error(message))
  },
)

async function unwrap<T>(
  request: Promise<{ data: ApiBody<T> }>,
): Promise<T> {
  const { data: body } = await request
  return unwrapBody(body)
}

export function get<T>(url: string, config?: AxiosRequestConfig) {
  return unwrap(requestClient.get<ApiBody<T>>(url, config))
}

export function post<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
  return unwrap(requestClient.post<ApiBody<T>>(url, data, config))
}

export function put<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
  return unwrap(requestClient.put<ApiBody<T>>(url, data, config))
}

export function del<T>(url: string, config?: AxiosRequestConfig) {
  return unwrap(requestClient.delete<ApiBody<T>>(url, config))
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
