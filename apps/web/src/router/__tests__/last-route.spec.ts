import { describe, expect, it } from 'vitest'

import {
  lastPathFor,
  rememberInMap,
  rememberableLayoutPath,
  resolveLoginLanding,
} from '../last-route'

const viewer = {
  menuCodes: ['workspace', 'analytics'],
  roles: ['user'],
  username: 'user',
}

const admin = {
  menuCodes: ['workspace', 'analytics', 'users', 'about'],
  roles: ['admin'],
  username: 'admin',
}

describe('rememberableLayoutPath', () => {
  it('keeps catalog pages and drops the rest', () => {
    expect(rememberableLayoutPath('/')).toBe('/')
    expect(rememberableLayoutPath('/profile?tab=1#top')).toBe('/profile')
    expect(rememberableLayoutPath('/users')).toBe('/users')
    expect(rememberableLayoutPath('/embed')).toBe('/embed')
    expect(rememberableLayoutPath('/embed/docs')).toBe('/embed/docs')
    expect(rememberableLayoutPath('/login')).toBeNull()
    expect(rememberableLayoutPath('/403')).toBeNull()
    expect(rememberableLayoutPath('/missing')).toBeNull()
    expect(rememberableLayoutPath('//evil.com')).toBeNull()
    expect(rememberableLayoutPath('https://evil.com')).toBeNull()
  })
})

describe('rememberInMap / lastPathFor', () => {
  it('stores one path per username and ignores junk', () => {
    const first = rememberInMap({}, '/users', 'vben')
    const second = rememberInMap(first, '/403', 'vben')
    const third = rememberInMap(second, '/workspace', 'user')
    expect(second).toBe(first)
    expect(lastPathFor(third, 'vben')).toBe('/users')
    expect(lastPathFor(third, 'user')).toBe('/workspace')
    expect(lastPathFor(third, 'admin')).toBeNull()
  })
})

describe('resolveLoginLanding', () => {
  it('prefers a safe redirect, then the last page, then home', () => {
    expect(resolveLoginLanding('/workspace', '/analytics', viewer)).toBe('/workspace')
    expect(resolveLoginLanding(undefined, '/analytics', viewer)).toBe('/analytics')
    expect(resolveLoginLanding(undefined, null, viewer)).toBe('/')
  })

  it('skips a redirect the account cannot open', () => {
    expect(resolveLoginLanding('/users', '/workspace', viewer)).toBe('/workspace')
    expect(resolveLoginLanding('/users', '/workspace', admin)).toBe('/users')
    expect(resolveLoginLanding('//evil.com', '/missing', viewer)).toBe('/')
  })
})
