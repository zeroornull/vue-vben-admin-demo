import { describe, expect, it } from 'vitest'

import { crumbsFromRoute, shouldShowCrumbs } from '../breadcrumb'

describe('crumbsFromRoute', () => {
  it('returns a single current crumb on home', () => {
    expect(crumbsFromRoute({ name: 'home', meta: { title: '工作台' } })).toEqual([
      { current: true, title: '工作台' },
    ])
  })

  it('prefixes home for a page without a group', () => {
    expect(crumbsFromRoute({ name: 'about', meta: { title: '关于' } })).toEqual([
      { current: false, name: 'home', title: '工作台' },
      { current: true, title: '关于' },
    ])
  })

  it('inserts the menu group as a non-link crumb', () => {
    expect(
      crumbsFromRoute({ name: 'users', meta: { group: '系统', title: '用户' } }),
    ).toEqual([
      { current: false, name: 'home', title: '工作台' },
      { current: false, title: '系统' },
      { current: true, title: '用户' },
    ])
  })

  it('skips untitled routes', () => {
    expect(crumbsFromRoute({ name: 'root', meta: {} })).toEqual([])
  })
})

describe('shouldShowCrumbs', () => {
  it('hides the bar on home', () => {
    expect(shouldShowCrumbs([{ current: true, title: '工作台' }])).toBe(false)
    expect(
      shouldShowCrumbs([
        { current: false, name: 'home', title: '工作台' },
        { current: true, title: '分析' },
      ]),
    ).toBe(true)
  })
})
