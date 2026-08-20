import MockAdapter from 'axios-mock-adapter'
import { createPinia, setActivePinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useAuthStore } from '@/stores/auth'
import { useRequestStore } from '@/stores/request'

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

  it('counts pending around a request', async () => {
    const store = useRequestStore()
    mock.onGet('/user/info').reply(() => {
      expect(store.pending).toBe(1)
      return [200, { code: 0, data: { username: 'vben' }, message: 'ok' }]
    })
    await get('/user/info')
    expect(store.pending).toBe(0)
  })

  it('counts two in-flight requests together', async () => {
    const store = useRequestStore()
    let peak = 0
    mock.onGet('/a').reply(() => {
      peak = Math.max(peak, store.pending)
      return [200, { code: 0, data: 1, message: 'ok' }]
    })
    mock.onGet('/b').reply(() => {
      peak = Math.max(peak, store.pending)
      return [200, { code: 0, data: 2, message: 'ok' }]
    })
    await Promise.all([get('/a'), get('/b')])
    expect(peak).toBe(2)
    expect(store.pending).toBe(0)
  })

  it('ends pending after a failed request', async () => {
    mock.onGet('/boom').reply(500, { code: 500, data: null, message: '挂了' })
    await expect(get('/boom')).rejects.toThrow('挂了')
    expect(useRequestStore().pending).toBe(0)
  })

  it('can skip the loading bar', async () => {
    const store = useRequestStore()
    mock.onGet('/quiet').reply(() => {
      expect(store.pending).toBe(0)
      return [200, { code: 0, data: true, message: 'ok' }]
    })
    await get('/quiet', { skipLoadingBar: true })
    expect(store.pending).toBe(0)
  })

  it('records a toast for business and HTTP errors', async () => {
    mock.onPost('/auth/login').reply(200, {
      code: 1,
      data: null,
      message: '账号或密码错误',
    })
    await expect(post('/auth/login', { password: 'bad', username: 'vben' })).rejects.toThrow(
      '账号或密码错误',
    )
    expect(useRequestStore().notice).toBe('账号或密码错误')

    useRequestStore().dismiss()
    mock.onGet('/boom').reply(500, { code: 500, data: null, message: '挂了' })
    await expect(get('/boom')).rejects.toThrow('挂了')
    expect(useRequestStore().notice).toBe('挂了')
  })

  it('can skip the error toast', async () => {
    mock.onPost('/auth/login').reply(200, {
      code: 1,
      data: null,
      message: '账号或密码错误',
    })
    await expect(
      post('/auth/login', { password: 'bad', username: 'vben' }, { skipErrorToast: true }),
    ).rejects.toThrow('账号或密码错误')
    expect(useRequestStore().notice).toBe('')
  })

  it('retries a GET 500 once and keeps one pending count', async () => {
    const store = useRequestStore()
    const pending: number[] = []
    mock
      .onGet('/flaky')
      .replyOnce(() => {
        pending.push(store.pending)
        return [500, { code: 500, data: null, message: '挂了' }]
      })
      .onGet('/flaky')
      .reply(() => {
        pending.push(store.pending)
        return [200, { code: 0, data: { ok: true }, message: 'ok' }]
      })
    await expect(get('/flaky')).resolves.toEqual({ ok: true })
    expect(pending).toEqual([1, 1])
    expect(store.pending).toBe(0)
    expect(store.notice).toBe('')
  })

  it('does not retry POST or skipped GETs', async () => {
    mock.onPost('/once').replyOnce(500, { code: 500, data: null, message: '挂了' })
    await expect(post('/once')).rejects.toThrow('挂了')
    mock.onGet('/quiet-fail').replyOnce(500, { code: 500, data: null, message: '挂了' })
    await expect(get('/quiet-fail', { skipRetry: true })).rejects.toThrow('挂了')
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
    expect(useRequestStore().notice).toBe('')
  })
})
