import { describe, expect, it } from 'vitest'

import { isMenuIconName, menuIcons, resolveMenuIcon } from '../menu-icons'

describe('isMenuIconName / resolveMenuIcon', () => {
  it('resolves registered keys only', () => {
    expect(isMenuIconName('users')).toBe(true)
    expect(isMenuIconName('TeamOutlined')).toBe(false)
    expect(isMenuIconName('ant-design:team-outlined')).toBe(false)
    expect(isMenuIconName('mdi:home')).toBe(false)
    expect(resolveMenuIcon('users')).toBe(menuIcons.users)
    expect(resolveMenuIcon('TeamOutlined')).toBeUndefined()
    expect(resolveMenuIcon('ant-design:team-outlined')).toBeUndefined()
    expect(resolveMenuIcon('mdi:home')).toBeUndefined()
    expect(resolveMenuIcon(undefined)).toBeUndefined()
    expect(resolveMenuIcon('')).toBeUndefined()
  })

  it('keeps a key for every layout page', () => {
    expect(Object.keys(menuIcons).sort()).toEqual([
      'about',
      'analytics',
      'audit',
      'depts',
      'embed',
      'home',
      'links',
      'profile',
      'roles',
      'users',
      'workspace',
    ])
    expect(menuIcons.users).toBe('ant-design:team-outlined')
  })
})
