import { describe, expect, it } from 'vitest'

import { excludeCachedName, readViewName, viewInstanceKey } from '../view-refresh'

describe('readViewName', () => {
  it('only accepts a string viewName', () => {
    expect(readViewName({ viewName: 'UsersView' })).toBe('UsersView')
    expect(readViewName({})).toBe('')
    expect(readViewName({ viewName: 1 })).toBe('')
  })
})

describe('excludeCachedName', () => {
  it('drops the current view so KeepAlive destroys it', () => {
    expect(excludeCachedName(['HomeView', 'UsersView'], 'UsersView')).toEqual(['HomeView'])
    expect(excludeCachedName(['HomeView'], '')).toEqual(['HomeView'])
  })
})

describe('viewInstanceKey', () => {
  it('changes when the epoch bumps', () => {
    expect(viewInstanceKey('users', 0)).toBe('users:0')
    expect(viewInstanceKey('users', 1)).toBe('users:1')
  })
})
