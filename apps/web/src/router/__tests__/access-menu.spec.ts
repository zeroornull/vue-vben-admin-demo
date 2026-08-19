import { describe, expect, it } from 'vitest'

import { canSeeRoute } from '../access-menu'

describe('canSeeRoute', () => {
  it('hides routes without a title', () => {
    expect(canSeeRoute({ path: '/hidden', meta: {} }, ['admin'])).toBe(false)
  })

  it('hides routes marked hideInMenu', () => {
    expect(
      canSeeRoute({ path: '/x', meta: { hideInMenu: true, title: 'X' } }, ['admin']),
    ).toBe(false)
  })

  it('shows unrestricted titled routes to any role', () => {
    expect(canSeeRoute({ path: '/', meta: { title: '工作台' } }, ['user'])).toBe(
      true,
    )
  })

  it('filters by required roles', () => {
    const about = { path: '/about', meta: { roles: ['admin'], title: '关于' } }
    expect(canSeeRoute(about, ['user'])).toBe(false)
    expect(canSeeRoute(about, ['admin'])).toBe(true)
  })
})
