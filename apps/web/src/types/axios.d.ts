import 'axios'

declare module 'axios' {
  interface AxiosRequestConfig {
    /** 为 true 时不计入顶栏进度条（以后给轮询用） */
    skipLoadingBar?: boolean
    /** 为 true 时不弹出全局错误条（登录表单自己展示） */
    skipErrorToast?: boolean
    /** 为 true 时不重试（轮询） */
    skipRetry?: boolean
    /** 已经补打的次数，拦截器自己加 */
    retryCount?: number
  }
}
