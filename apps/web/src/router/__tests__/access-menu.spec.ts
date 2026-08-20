import { describe, expect, it } from 'vitest'

import { canSeeRoute, groupMenuItems, toMenuItems } from '../access-menu'
import { staticLayoutNames } from '../routes'

const viewer = { menuCodes: ['users', 'depts', 'roles', 'about'], roles: ['user'] }
const admin = { menuCodes: ['users', 'depts', 'roles', 'about'], roles: ['admin'] }

describe('canSeeRoute', () => {
  it('hides routes without a title', () => {
    expect(canSeeRoute({ path: '/hidden', meta: {} }, admin)).toBe(false)
  })

  it('lists static layout names for tab allowlists', () => {
    expect(staticLayoutNames()).toEqual(['home', 'profile'])
  })

  it('hides routes marked hideInMenu', () => {
    expect(
      canSeeRoute({ path: '/x', meta: { hideInMenu: true, title: 'X' } }, admin),
    ).toBe(false)
  })

  it('shows the home route without a menu code', () => {
    expect(canSeeRoute({ path: '/', meta: { title: '工作台' } }, viewer)).toBe(true)
  })

  it('hides pages the business role did not grant', () => {
    expect(
      canSeeRoute(
        { path: '/users', meta: { menuCode: 'users', title: '用户' } },
        { menuCodes: [], roles: ['admin'] },
      ),
    ).toBe(false)
  })

  it('filters by login roles after the menu code passes', () => {
    const about = { path: '/about', meta: { menuCode: 'about', roles: ['admin'], title: '关于' } }
    expect(canSeeRoute(about, viewer)).toBe(false)
    expect(canSeeRoute(about, admin)).toBe(true)
  })
})

describe('groupMenuItems', () => {
  it('keeps ungrouped items in encounter order and clusters groups', () => {
    const groups = groupMenuItems(
      toMenuItems(
        [
          { path: '/', name: 'home', meta: { order: 0, title: '工作台' } },
          { path: '/users', name: 'users', meta: { group: '系统', menuCode: 'users', order: 3, title: '用户' } },
          { path: '/depts', name: 'depts', meta: { group: '系统', menuCode: 'depts', order: 4, title: '部门' } },
          { path: '/roles', name: 'roles', meta: { group: '系统', menuCode: 'roles', order: 5, title: '角色' } },
          { path: '/about', name: 'about', meta: { menuCode: 'about', order: 5, title: '关于' } },
        ],
        viewer,
      ),
    )
    expect(groups.map((group) => group.title)).toEqual([null, '系统', null])
    expect(groups[0]?.items.map((item) => item.name)).toEqual(['home'])
    expect(groups[1]?.items.map((item) => item.name)).toEqual(['users', 'depts', 'roles'])
    expect(groups[2]?.items.map((item) => item.name)).toEqual(['about'])
  })

  it('copies meta.icon onto the menu item', () => {
    const [item] = toMenuItems(
      [{ path: '/users', name: 'users', meta: { icon: 'users', menuCode: 'users', title: '用户' } }],
      viewer,
    )
    expect(item?.icon).toBe('users')
  })
})
