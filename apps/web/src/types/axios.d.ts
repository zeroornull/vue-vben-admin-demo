import 'axios'

declare module 'axios' {
  interface AxiosRequestConfig {
    /** 为 true 时不计入顶栏进度条（以后给轮询用） */
    skipLoadingBar?: boolean
  }
}
