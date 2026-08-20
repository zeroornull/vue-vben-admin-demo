import { describe, expect, it, vi } from 'vitest'

import { HOME_PATH, LOGIN_PATH } from '@/constants/auth'
import type { UserInfo } from '@/types/user'

import { decideAccess, redirectQuery } from '../guard'

const user: UserInfo = {
  actionCodes: [],
  homePath: '/',
  menuCodes: ['workspace', 'analytics'],
  realName: 'User',
  roleCodes: ['viewer'],
  roles: ['user'],
  userId: '3',
  username: 'user',
}

const admin: UserInfo = {
  actionCodes: [
    'user:create',
    'user:update',
    'user:delete',
    'dept:create',
    'dept:update',
    'dept:delete',
    'role:create',
    'role:update',
    'role:delete',
  ],
  homePath: '/',
  menuCodes: ['workspace', 'analytics', 'users', 'depts', 'roles', 'about'],
  realName: 'Admin',
  roleCodes: ['biz-admin'],
  roles: ['admin'],
  userId: '2',
  username: 'admin',
}

function ctx(overrides?: Partial<Parameters<typeof decideAccess>[1]>) {
  return {
    accessToken: '',
    applyAccessRoutes: vi.fn(),
    clearSession: vi.fn(),
    fetchUserInfo: vi.fn().mockResolvedValue(user),
    invalidateAccess: vi.fn(),
    isAccessGenerated: true,
    markAccessGenerated: vi.fn(),
    resetAccessRoutes: vi.fn(),
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

  it('treats a catalog path as protected even if the router matched 404', async () => {
    await expect(
      decideAccess(
        {
          fullPath: '/users',
          meta: { public: true },
          path: '/users',
          query: {},
        },
        ctx(),
      ),
    ).resolves.toEqual({
      path: LOGIN_PATH,
      query: { redirect: '/users' },
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
    const resetAccessRoutes = vi.fn()
    const invalidateAccess = vi.fn()
    await expect(
      decideAccess(
        { fullPath: '/workspace', meta: {}, path: '/workspace', query: {} },
        ctx({
          accessToken: 'expired',
          clearSession,
          fetchUserInfo: vi.fn().mockRejectedValue(new Error('未登录')),
          invalidateAccess,
          resetAccessRoutes,
        }),
      ),
    ).resolves.toEqual({
      path: LOGIN_PATH,
      query: { redirect: '/workspace' },
      replace: true,
    })
    expect(clearSession).toHaveBeenCalledOnce()
    expect(resetAccessRoutes).toHaveBeenCalledOnce()
    expect(invalidateAccess).toHaveBeenCalledOnce()
  })

  it('generates dynamic routes once and rematches', async () => {
    const applyAccessRoutes = vi.fn()
    const markAccessGenerated = vi.fn()
    await expect(
      decideAccess(
        { fullPath: '/workspace', meta: {}, path: '/workspace', query: {} },
        ctx({
          accessToken: 'mock.user',
          applyAccessRoutes,
          isAccessGenerated: false,
          markAccessGenerated,
          userInfo: user,
        }),
      ),
    ).resolves.toEqual({ path: '/workspace', query: {}, replace: true })
    expect(applyAccessRoutes).toHaveBeenCalledOnce()
    expect(applyAccessRoutes.mock.calls[0]?.[0].map((route) => route.name)).toEqual([
      'workspace',
      'analytics',
    ])
    expect(markAccessGenerated).toHaveBeenCalledOnce()
  })

  it('lets any signed-in user open the static profile page', async () => {
    await expect(
      decideAccess(
        { fullPath: '/profile', meta: {}, path: '/profile', query: {} },
        ctx({ accessToken: 'mock.user', userInfo: user }),
      ),
    ).resolves.toBe(true)
  })

  it('blocks a catalog page the business role did not grant', async () => {
    await expect(
      decideAccess(
        { fullPath: '/users', meta: {}, path: '/users', query: {} },
        ctx({ accessToken: 'mock.user', userInfo: user }),
      ),
    ).resolves.toEqual({ name: 'forbidden', replace: true })
  })

  it('blocks login roles that do not match even when the menu is granted', async () => {
    await expect(
      decideAccess(
        {
          fullPath: '/about',
          meta: { menuCode: 'about', roles: ['admin'] },
          path: '/about',
          query: {},
        },
        ctx({
          accessToken: 'mock.user',
          userInfo: { ...user, menuCodes: ['about'] },
        }),
      ),
    ).resolves.toEqual({ name: 'forbidden', replace: true })
  })

  it('blocks about when the admin login is missing the menu code', async () => {
    await expect(
      decideAccess(
        { fullPath: '/about', meta: {}, path: '/about', query: {} },
        ctx({
          accessToken: 'mock.admin',
          userInfo: { ...admin, menuCodes: ['workspace'] },
        }),
      ),
    ).resolves.toEqual({ name: 'forbidden', replace: true })
  })

  it('resets dynamic routes after the session is gone', async () => {
    const resetAccessRoutes = vi.fn()
    const invalidateAccess = vi.fn()
    await decideAccess(
      { fullPath: '/workspace', meta: {}, path: '/workspace', query: {} },
      ctx({
        isAccessGenerated: true,
        invalidateAccess,
        resetAccessRoutes,
      }),
    )
    expect(resetAccessRoutes).toHaveBeenCalledOnce()
    expect(invalidateAccess).toHaveBeenCalledOnce()
  })
})
