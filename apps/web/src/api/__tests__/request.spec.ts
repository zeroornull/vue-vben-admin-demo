import MockAdapter from 'axios-mock-adapter'
import { createPinia, setActivePinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useAuthStore } from '@/stores/auth'

import { get, post, requestClient, unwrapBody } from '../request'

vi.mock('@/router', () => ({
  default: {
    replace: vi.fn(),
  },
}))

describe('unwrapBody', () => {
  it('returns data when code is 0', () => {
    expect(unwrapBody({ code: 0, data: { accessToken: 't' }, message: 'ok' })).toEqual({
      accessToken: 't',
    })
  })

  it('throws the server message otherwise', () => {
    expect(() =>
      unwrapBody({ code: 1, data: null, message: '账号或密码错误' }),
    ).toThrow('账号或密码错误')
  })
})

describe('requestClient', () => {
  let mock: MockAdapter

  beforeEach(() => {
    const pinia = createPinia()
    pinia.use(piniaPluginPersistedstate)
    setActivePinia(pinia)
    mock = new MockAdapter(requestClient)
  })

  afterEach(() => {
    mock.restore()
  })

  it('attaches the bearer token', async () => {
    const store = useAuthStore()
    store.accessToken = 'mock.vben'
    mock.onGet('/user/info').reply((config) => {
      expect(config.headers?.Authorization).toBe('Bearer mock.vben')
      return [200, { code: 0, data: { username: 'vben' }, message: 'ok' }]
    })
    await expect(get('/user/info')).resolves.toEqual({ username: 'vben' })
  })

  it('unwraps a successful login payload', async () => {
    mock.onPost('/auth/login').reply(200, {
      code: 0,
      data: { accessToken: 'mock.vben' },
      message: 'ok',
    })
    await expect(post('/auth/login', { password: '123456', username: 'vben' })).resolves.toEqual({
      accessToken: 'mock.vben',
    })
  })

  it('rejects business errors without treating them as HTTP failures', async () => {
    mock.onPost('/auth/login').reply(200, {
      code: 1,
      data: null,
      message: '账号或密码错误',
    })
    await expect(
      post('/auth/login', { password: 'bad', username: 'vben' }),
    ).rejects.toThrow('账号或密码错误')
  })

  it('clears the session on HTTP 401', async () => {
    const store = useAuthStore()
    store.accessToken = 'expired'
    mock.onGet('/user/info').reply(401, {
      code: 401,
      data: null,
      message: '未登录或登录已过期',
    })
    await expect(get('/user/info')).rejects.toThrow()
    expect(store.accessToken).toBe('')
  })
})
