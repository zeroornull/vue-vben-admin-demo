import { describe, expect, it } from 'vitest'

import { heldCodes, matchAccess, normalizeAccessCodes, readAccessKind } from '../match'

const viewer = {
  actionCodes: ['user:create', 'user:update'],
  menuCodes: ['users', 'analytics'],
  roleCodes: ['biz-admin'],
  roles: ['admin'],
}

describe('normalizeAccessCodes', () => {
  it('accepts a string or a list and drops blanks', () => {
    expect(normalizeAccessCodes('user:create')).toEqual(['user:create'])
    expect(normalizeAccessCodes(['user:create', '  ', 'user:update'])).toEqual([
      'user:create',
      'user:update',
    ])
    expect(normalizeAccessCodes('')).toEqual([])
    expect(normalizeAccessCodes(null)).toEqual([])
  })
})

describe('readAccessKind / heldCodes', () => {
  it('defaults to action codes', () => {
    expect(readAccessKind(undefined)).toBe('action')
    expect(readAccessKind('action')).toBe('action')
    expect(readAccessKind('nope')).toBe('action')
    expect(heldCodes('action', viewer)).toEqual(['user:create', 'user:update'])
    expect(heldCodes('menu', viewer)).toEqual(['users', 'analytics'])
    expect(heldCodes('role', viewer)).toEqual(['admin'])
    expect(heldCodes('action', null)).toEqual([])
  })
})

describe('matchAccess', () => {
  it('matches a single action code', () => {
    expect(matchAccess({ value: 'user:create' }, viewer)).toBe(true)
    expect(matchAccess({ value: 'user:delete' }, viewer)).toBe(false)
  })

  it('treats a list as OR', () => {
    expect(matchAccess({ value: ['user:delete', 'user:update'] }, viewer)).toBe(true)
    expect(matchAccess({ value: ['user:delete', 'role:create'] }, viewer)).toBe(false)
  })

  it('reads login roles, not business roleCodes', () => {
    expect(matchAccess({ arg: 'role', value: 'admin' }, viewer)).toBe(true)
    expect(matchAccess({ arg: 'role', value: 'biz-admin' }, viewer)).toBe(false)
    expect(matchAccess({ arg: 'menu', value: 'users' }, viewer)).toBe(true)
    expect(matchAccess({ arg: 'menu', value: 'roles' }, viewer)).toBe(false)
  })

  it('denies empty bindings and missing viewer', () => {
    expect(matchAccess({ value: '' }, viewer)).toBe(false)
    expect(matchAccess({ value: [] }, viewer)).toBe(false)
    expect(matchAccess({ value: 'user:create' }, null)).toBe(false)
  })
})
