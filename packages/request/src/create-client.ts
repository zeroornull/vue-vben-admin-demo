import axios, { type AxiosError, type AxiosRequestConfig } from 'axios'

import { isCanceledError, withPageAbort } from './abort.ts'
import { shouldTrackLoading } from './pending.ts'
import { retryCountOf, shouldRetryRequest } from './retry.ts'
import { errorToastText, requestError, shouldAnnounceError } from './toast.ts'
import { unwrapBody, type ApiBody } from './unwrap.ts'

export type RequestSession = {
  announceError: (text: string) => void
  baseURL: string
  beginLoading: () => void
  endLoading: () => void
  getAccessToken: () => string
  onUnauthorized: () => void | Promise<void>
}

export function createRequestClient(session: RequestSession) {
  const requestClient = axios.create({
    baseURL: session.baseURL,
    timeout: 10_000,
  })

  function finishLoading(config: AxiosRequestConfig | undefined) {
    if (!config || !shouldTrackLoading(config)) return
    session.endLoading()
  }

  requestClient.interceptors.request.use((config) => {
    const token = session.getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    if (shouldTrackLoading(config) && retryCountOf(config) === 0) {
      session.beginLoading()
    }
    return config
  })

  requestClient.interceptors.response.use(
    (response) => {
      finishLoading(response.config)
      const body = response.data as ApiBody<unknown>
      if (body.code === 401) {
        void session.onUnauthorized()
      }
      return response
    },
    (error: AxiosError<ApiBody<unknown>>) => {
      const config = error.config
      if (isCanceledError(error)) {
        finishLoading(config)
        return Promise.reject(requestError('已取消', true))
      }
      const status = error.response?.status
      const unauthorized = status === 401
      if (unauthorized) {
        void session.onUnauthorized()
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
      const message = error.response?.data?.message || error.message || '网络错误'
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
        session.announceError(errorToastText(error))
      }
      throw error
    }
  }

  function get<T>(url: string, config?: AxiosRequestConfig) {
    const next = withPageAbort(config)
    return unwrap(requestClient.get<ApiBody<T>>(url, next), next)
  }

  function post<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return unwrap(requestClient.post<ApiBody<T>>(url, data, config), config)
  }

  function put<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return unwrap(requestClient.put<ApiBody<T>>(url, data, config), config)
  }

  function del<T>(url: string, config?: AxiosRequestConfig) {
    return unwrap(requestClient.delete<ApiBody<T>>(url, config), config)
  }

  return { del, get, post, put, requestClient }
}
