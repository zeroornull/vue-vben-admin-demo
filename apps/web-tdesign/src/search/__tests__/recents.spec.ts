import { describe, expect, it } from 'vitest'

import type { AccessMenuItem } from '../../router/access-menu'
import {
  firstSearchHit,
  rememberSearchRecent,
  SEARCH_RECENT_MAX,
  searchListWithoutRecents,
  visibleSearchRecents,
} from '../recents'

const item = (name: string, title = name, path?: string): AccessMenuItem => ({
  name,
  order: 0,
  path,
  title,
})

describe('rememberSearchRecent / visibleSearchRecents', () => {
  it('keeps the newest first, per account, and drops lost grants', () => {
    let map = rememberSearchRecent({}, 'vben', item('users'))
    map = rememberSearchRecent(map, 'vben', item('roles'))
    map = rememberSearchRecent(map, 'admin', item('about'))
    expect(map.vben?.map((row) => row.name)).toEqual(['roles', 'users'])
    expect(map.admin?.map((row) => row.name)).toEqual(['about'])
    map = rememberSearchRecent(map, 'vben', item('users'))
    expect(map.vben?.map((row) => row.name)).toEqual(['users', 'roles'])
    expect(
      visibleSearchRecents(map.vben, [item('users'), item('depts')]).map((row) => row.name),
    ).toEqual(['users'])
    let many = {}
    for (let index = 0; index < SEARCH_RECENT_MAX + 2; index += 1) {
      many = rememberSearchRecent(many, 'vben', item(`p-${index}`))
    }
    expect(many.vben).toHaveLength(SEARCH_RECENT_MAX)
    expect(many.vben?.[0]?.name).toBe(`p-${SEARCH_RECENT_MAX + 1}`)
  })
})

describe('searchListWithoutRecents / firstSearchHit', () => {
  it('pins recents when the box is empty, then falls back to title match', () => {
    const items = [item('home', '工作台'), item('users', '用户'), item('roles', '角色')]
    const recents = [item('users', '用户')]
    expect(searchListWithoutRecents(items, '', recents).map((row) => row.name)).toEqual([
      'home',
      'roles',
    ])
    expect(searchListWithoutRecents(items, '角', recents).map((row) => row.name)).toEqual(['roles'])
    expect(firstSearchHit('', recents, items)?.name).toBe('users')
    expect(firstSearchHit('角', recents, [item('roles', '角色')])?.name).toBe('roles')
  })
})
