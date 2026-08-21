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
