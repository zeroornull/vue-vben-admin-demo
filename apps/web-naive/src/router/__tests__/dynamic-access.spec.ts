import { describe, expect, it } from 'vitest'

import { matchLayoutChild, matchRoutePath } from '../dynamic-access'

describe('matchRoutePath / matchLayoutChild', () => {
  it('matches exact catalog paths and embed params', () => {
    expect(matchRoutePath('users', 'users')).toBe(true)
    expect(matchRoutePath('embed/:code', 'embed/docs')).toBe(true)
    expect(matchRoutePath('embed/:code', 'embed')).toBe(false)
    expect(matchRoutePath('embed', 'embed/docs')).toBe(false)
    expect(matchLayoutChild('/users')?.name).toBe('users')
    expect(matchLayoutChild('/embed')?.name).toBe('embed')
    expect(matchLayoutChild('/embed/docs')?.name).toBe('embed-link')
    expect(matchLayoutChild('/missing')).toBeUndefined()
  })
})
