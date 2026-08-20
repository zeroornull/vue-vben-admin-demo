import { describe, expect, it } from 'vitest'

import type { UserInfo } from '@/types/user'

import { formatMenuCodes, profileRows } from '../query'

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
  })
})
