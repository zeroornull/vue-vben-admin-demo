import { describe, expect, it } from 'vitest'

import {
  cachedViewNames,
  closeAllTabs,
  closeLeftTabs,
  closeOtherTabs,
  closeRightTabs,
  closeTab,
  ensureHome,
  HOME_TAB,
  nextPathAfterClose,
  nextPathIfMissing,
  pruneTabs,
  reorderTabs,
  tabFromRoute,
  tabIconName,
  tabMenuActions,
  upsertTab,
} from '../tab-query'

const users = {
  affix: false,
  fullPath: '/users',
  icon: 'users',
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
        meta: { affixTab: false, icon: 'users', title: '用户', viewName: 'UsersView' },
        name: 'users',
      }),
    ).toEqual(users)
  })
})

describe('tabIconName', () => {
  it('falls back to the route name for persisted tabs without icon', () => {
    expect(tabIconName({ icon: 'users', name: 'users' })).toBe('users')
    expect(tabIconName({ name: 'users' })).toBe('users')
    expect(HOME_TAB.icon).toBe('home')
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

describe('closeLeftTabs / closeRightTabs / closeAllTabs', () => {
  const list = [HOME_TAB, users, depts]

  it('keeps affix tabs and the pivot', () => {
    expect(closeLeftTabs(list, 'depts')).toEqual([HOME_TAB, depts])
    expect(closeRightTabs(list, 'users')).toEqual([HOME_TAB, users])
    expect(closeAllTabs(list)).toEqual([HOME_TAB])
  })
})

describe('nextPathIfMissing / reorderTabs / tabMenuActions', () => {
  const list = [HOME_TAB, users, depts]

  it('stays put when the current tab remains', () => {
    expect(nextPathIfMissing(list, 'users')).toBeNull()
    expect(nextPathIfMissing([HOME_TAB], 'users', 'home')).toBe('/')
  })

  it('cannot move the affix home tab and drops onto home after it', () => {
    expect(reorderTabs(list, 'home', 'depts')).toEqual(list)
    expect(reorderTabs(list, 'depts', 'home')).toEqual([HOME_TAB, depts, users])
    expect(reorderTabs(list, 'users', 'depts')).toEqual([HOME_TAB, depts, users])
  })

  it('hides close actions that would do nothing', () => {
    expect(tabMenuActions([HOME_TAB], 'home')).toEqual(['refresh'])
    expect(tabMenuActions(list, 'home')).toEqual(['refresh', 'closeOthers', 'closeRight', 'closeAll'])
    expect(tabMenuActions(list, 'users')).toEqual([
      'refresh',
      'close',
      'closeOthers',
      'closeRight',
      'closeAll',
    ])
    expect(tabMenuActions(list, 'depts')).toEqual([
      'refresh',
      'close',
      'closeOthers',
      'closeLeft',
      'closeAll',
    ])
  })
})
