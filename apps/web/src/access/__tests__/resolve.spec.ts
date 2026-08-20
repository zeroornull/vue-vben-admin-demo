import { describe, expect, it } from 'vitest'

import { seedActionCodes, seedMenuCodes } from '../catalog'
import {
  canAccessRoute,
  dropActionsForMenu,
  filterDynamicRoutes,
  grantParentMenus,
  hasAccessCode,
  resolveActionCodes,
  resolveMenuCodes,
  sanitizeActionCodes,
  sanitizeMenuCodes,
} from '../resolve'

const roles = [
  {
    actionCodes: seedActionCodes('biz-admin'),
    code: 'biz-admin',
    menuCodes: seedMenuCodes('biz-admin'),
    status: 1 as const,
  },
  {
    actionCodes: seedActionCodes('editor'),
    code: 'editor',
    menuCodes: seedMenuCodes('editor'),
    status: 1 as const,
  },
  {
    actionCodes: seedActionCodes('viewer'),
    code: 'viewer',
    menuCodes: seedMenuCodes('viewer'),
    status: 1 as const,
  },
  { actionCodes: ['user:delete'], code: 'retired', menuCodes: ['users'], status: 0 as const },
]

describe('sanitizeMenuCodes / sanitizeActionCodes', () => {
  it('drops unknown codes and dedupes', () => {
    expect(sanitizeMenuCodes(['users', 'users', 'nope', 1])).toEqual(['users'])
    expect(sanitizeActionCodes(['user:create', 'user:create', 'nope'])).toEqual(['user:create'])
  })
})

describe('resolveMenuCodes', () => {
  it('unions enabled roles and skips disabled ones', () => {
    expect(resolveMenuCodes(['editor', 'viewer', 'retired'], roles)).toEqual([
      'workspace',
      'analytics',
      'users',
      'depts',
      'embed',
    ])
  })

  it('returns nothing when the mapped role is missing or disabled', () => {
    expect(resolveMenuCodes(['retired'], roles)).toEqual([])
    expect(resolveMenuCodes(['ghost'], roles)).toEqual([])
  })
})

describe('resolveActionCodes / grantParentMenus', () => {
  it('unions actions from enabled roles only', () => {
    expect(resolveActionCodes(['editor', 'retired'], roles)).toEqual([
      'user:create',
      'user:update',
      'dept:create',
      'dept:update',
    ])
  })

  it('adds the parent menu when an action is granted', () => {
    expect(grantParentMenus(['analytics'], ['user:delete', 'role:create'])).toEqual([
      'analytics',
      'users',
      'roles',
    ])
  })

  it('drops child actions when the menu is unchecked', () => {
    expect(dropActionsForMenu(['user:create', 'dept:update'], 'users')).toEqual(['dept:update'])
  })

  it('checks a single action code', () => {
    expect(hasAccessCode(['user:create'], 'user:create')).toBe(true)
    expect(hasAccessCode(['user:create'], 'user:delete')).toBe(false)
  })
})

describe('canAccessRoute / filterDynamicRoutes', () => {
  const about = {
    path: 'about',
    meta: { menuCode: 'about', roles: ['admin'], title: '关于' },
  }
  const users = {
    path: 'users',
    meta: { menuCode: 'users', title: '用户' },
  }

  it('requires the menu code', () => {
    expect(canAccessRoute(users, { menuCodes: ['analytics'], roles: ['admin'] })).toBe(false)
    expect(canAccessRoute(users, { menuCodes: ['users'], roles: ['user'] })).toBe(true)
  })

  it('still requires login roles when the route says so', () => {
    const viewer = { menuCodes: ['about'], roles: ['user'] }
    const admin = { menuCodes: ['about'], roles: ['admin'] }
    expect(canAccessRoute(about, viewer)).toBe(false)
    expect(canAccessRoute(about, admin)).toBe(true)
  })

  it('keeps routes that have no menuCode', () => {
    const home = { path: '', meta: { title: '工作台' } }
    expect(canAccessRoute(home, { menuCodes: [], roles: ['user'] })).toBe(true)
  })

  it('filters a catalog down to what the viewer may enter', () => {
    const allowed = filterDynamicRoutes([users, about], {
      menuCodes: ['users', 'about'],
      roles: ['user'],
    })
    expect(allowed.map((route) => route.path)).toEqual(['users'])
  })
})
