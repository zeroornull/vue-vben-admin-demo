import { describe, expect, it } from 'vitest'

import {
  cachedViewNames,
  closeOtherTabs,
  closeTab,
  ensureHome,
  HOME_TAB,
  nextPathAfterClose,
  pruneTabs,
  tabFromRoute,
  upsertTab,
} from '../tab-query'

const users = {
  affix: false,
  fullPath: '/users',
  name: 'users',
  title: '用户',
  viewName: 'UsersView',
}

const depts = {
  affix: false,
  fullPath: '/depts',
  name: 'depts',
  title: '部门',
  viewName: 'DeptsView',
}

describe('tabFromRoute', () => {
  it('requires title and viewName', () => {
    expect(tabFromRoute({ fullPath: '/x', meta: { title: 'X' }, name: 'x' })).toBeNull()
    expect(
      tabFromRoute({
        fullPath: '/users',
        meta: { affixTab: false, title: '用户', viewName: 'UsersView' },
        name: 'users',
      }),
    ).toEqual(users)
  })
})

describe('upsertTab / ensureHome', () => {
  it('prepends the affix home tab when missing', () => {
    expect(ensureHome([users])[0]).toEqual(HOME_TAB)
  })

  it('updates the path of an existing tab and keeps affix', () => {
    const next = upsertTab([HOME_TAB, users], { ...users, fullPath: '/users?page=2' })
    expect(next).toEqual([HOME_TAB, { ...users, fullPath: '/users?page=2' }])
    expect(upsertTab([HOME_TAB], { ...HOME_TAB, title: '首页' })[0]?.affix).toBe(true)
  })
})

describe('closeTab / closeOtherTabs / pruneTabs', () => {
  const list = [HOME_TAB, users, depts]

  it('cannot close the affix home tab', () => {
    expect(closeTab(list, 'home')).toEqual(list)
  })

  it('closes a regular tab', () => {
    expect(closeTab(list, 'users')).toEqual([HOME_TAB, depts])
  })

  it('keeps affix tabs when closing others', () => {
    expect(closeOtherTabs(list, 'depts')).toEqual([HOME_TAB, depts])
  })

  it('drops tabs the session can no longer open', () => {
    expect(pruneTabs(list, ['home', 'users'])).toEqual([HOME_TAB, users])
  })
})

describe('nextPathAfterClose / cachedViewNames', () => {
  const list = [HOME_TAB, users, depts]

  it('stays put when closing a background tab', () => {
    expect(nextPathAfterClose(list, 'users', 'depts')).toBeNull()
  })

  it('goes to the previous tab when closing the current one', () => {
    expect(nextPathAfterClose(list, 'depts', 'depts')).toBe('/users')
    expect(nextPathAfterClose(list, 'users', 'users')).toBe('/')
  })

  it('lists unique component names for KeepAlive', () => {
    expect(cachedViewNames([HOME_TAB, users, users])).toEqual(['HomeView', 'UsersView'])
  })
})
