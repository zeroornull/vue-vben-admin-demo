import { describe, expect, it } from 'vitest'

import type { UserInfo } from '@/types/user'

import {
  formatMenuCodes,
  profileRows,
  validatePasswordChange,
  validateProfileForm,
} from '../query'

const user: UserInfo = {
  actionCodes: ['user:create'],
  homePath: '/',
  menuCodes: ['workspace', 'users'],
  realName: 'User',
  roleCodes: ['viewer'],
  roles: ['user'],
  userId: '3',
  username: 'user',
}

describe('formatMenuCodes / profileRows', () => {
  it('uses catalog titles for menus', () => {
    expect(formatMenuCodes(['workspace', 'users'])).toBe('工作区 / 用户')
    expect(formatMenuCodes([])).toBe('无')
  })

  it('keeps login roles and business role codes on separate rows', () => {
    const rows = profileRows(user)
    expect(rows.find((row) => row.key === 'roles')?.value).toBe('user')
    expect(rows.find((row) => row.key === 'roleCodes')?.value).toBe('viewer')
    expect(rows.find((row) => row.key === 'actionCodes')?.value).toContain('新建')
    expect(rows.find((row) => row.key === 'realName')).toBeUndefined()
  })
})

describe('validateProfileForm', () => {
  it('trims and rejects blanks or overlong names', () => {
    expect(validateProfileForm({ realName: '  王伟  ' })).toEqual({
      ok: true,
      value: { realName: '王伟' },
    })
    expect(validateProfileForm({ realName: '   ' }).ok).toBe(false)
    expect(validateProfileForm({ realName: 'x'.repeat(21) }).ok).toBe(false)
  })
})

describe('validatePasswordChange', () => {
  it('keeps passwords exact and rejects the usual mistakes', () => {
    expect(
      validatePasswordChange({
        confirmPassword: 'abcdef',
        currentPassword: '123456',
        newPassword: 'abcdef',
      }),
    ).toEqual({
      ok: true,
      value: { confirmPassword: 'abcdef', currentPassword: '123456', newPassword: 'abcdef' },
    })
    expect(
      validatePasswordChange({
        confirmPassword: '123456',
        currentPassword: '',
        newPassword: '123456',
      }).ok,
    ).toBe(false)
    expect(
      validatePasswordChange({
        confirmPassword: 'abc',
        currentPassword: '123456',
        newPassword: 'abc',
      }).ok,
    ).toBe(false)
    expect(
      validatePasswordChange({
        confirmPassword: 'abcdefg',
        currentPassword: '123456',
        newPassword: 'abcdef',
      }).ok,
    ).toBe(false)
    expect(
      validatePasswordChange({
        confirmPassword: '123456',
        currentPassword: '123456',
        newPassword: '123456',
      }).ok,
    ).toBe(false)
  })
})
