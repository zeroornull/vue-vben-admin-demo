import { describe, expect, it, vi } from 'vitest'

import { HOME_PATH, LOGIN_PATH } from '@/constants/auth'
import type { UserInfo } from '@/types/user'

import { decideAccess, redirectQuery } from '../guard'

const user: UserInfo = {
  homePath: '/',
  realName: 'User',
  roles: ['user'],
  userId: '3',
  username: 'user',
}

function ctx(overrides?: Partial<Parameters<typeof decideAccess>[1]>) {
  return {
    accessToken: '',
    clearSession: vi.fn(),
    fetchUserInfo: vi.fn().mockResolvedValue(user),
    userInfo: null,
    ...overrides,
  }
}

describe('redirectQuery', () => {
  it('omits redirect when already going home', () => {
    expect(redirectQuery(HOME_PATH)).toEqual({})
  })

  it('keeps the original path for later return', () => {
    expect(redirectQuery('/workspace')).toEqual({ redirect: '/workspace' })
  })
})

describe('decideAccess', () => {
  it('sends anonymous users to login with redirect', async () => {
    await expect(
      decideAccess(
        { fullPath: '/workspace', meta: {}, path: '/workspace', query: {} },
        ctx(),
      ),
    ).resolves.toEqual({
      path: LOGIN_PATH,
      query: { redirect: '/workspace' },
      replace: true,
    })
  })

  it('lets public routes through', async () => {
    await expect(
      decideAccess(
        { fullPath: '/missing', meta: { public: true }, path: '/missing', query: {} },
        ctx(),
      ),
    ).resolves.toBe(true)
  })

  it('sends a signed-in user away from login', async () => {
    await expect(
      decideAccess(
        { fullPath: LOGIN_PATH, meta: { public: true }, path: LOGIN_PATH, query: {} },
        ctx({ accessToken: 'mock.user' }),
      ),
    ).resolves.toBe(HOME_PATH)
  })

  it('honors login redirect query', async () => {
    await expect(
      decideAccess(
        {
          fullPath: LOGIN_PATH,
          meta: { public: true },
          path: LOGIN_PATH,
          query: { redirect: '/workspace' },
        },
        ctx({ accessToken: 'mock.user' }),
      ),
    ).resolves.toBe('/workspace')
  })

  it('fetches profile when token exists without userInfo', async () => {
    const fetchUserInfo = vi.fn().mockResolvedValue(user)
    await expect(
      decideAccess(
        { fullPath: '/', meta: {}, path: '/', query: {} },
        ctx({ accessToken: 'mock.user', fetchUserInfo }),
      ),
    ).resolves.toBe(true)
    expect(fetchUserInfo).toHaveBeenCalledOnce()
  })

  it('clears the session when profile fetch fails', async () => {
    const clearSession = vi.fn()
    await expect(
      decideAccess(
        { fullPath: '/workspace', meta: {}, path: '/workspace', query: {} },
        ctx({
          accessToken: 'expired',
          clearSession,
          fetchUserInfo: vi.fn().mockRejectedValue(new Error('未登录')),
        }),
      ),
    ).resolves.toEqual({
      path: LOGIN_PATH,
      query: { redirect: '/workspace' },
      replace: true,
    })
    expect(clearSession).toHaveBeenCalledOnce()
  })

  it('blocks roles that do not match', async () => {
    await expect(
      decideAccess(
        { fullPath: '/about', meta: { roles: ['admin'] }, path: '/about', query: {} },
        ctx({ accessToken: 'mock.user', userInfo: user }),
      ),
    ).resolves.toEqual({ name: 'forbidden', replace: true })
  })
})
