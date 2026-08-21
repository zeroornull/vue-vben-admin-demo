import { describe, expect, it } from 'vitest'

import { formatCodeList, userInitial, userMenuMeta } from '../user-menu'

describe('userInitial / formatCodeList', () => {
  it('takes the first visible character', () => {
    expect(userInitial(' 王伟 ')).toBe('王')
    expect(userInitial('vben')).toBe('v')
    expect(userInitial('')).toBe('?')
  })

  it('joins codes or shows 无', () => {
    expect(formatCodeList(['admin', 'user'])).toBe('admin / user')
    expect(formatCodeList([])).toBe('无')
  })
})

describe('userMenuMeta', () => {
  it('returns null without a session', () => {
    expect(userMenuMeta(null)).toBeNull()
  })

  it('keeps login roles and business role codes on separate lines', () => {
    expect(
      userMenuMeta({
        realName: 'Vben',
        roleCodes: ['biz-admin'],
        roles: ['admin', 'user'],
        username: 'vben',
      }),
    ).toEqual({
      bizRoles: 'biz-admin',
      initial: 'V',
      label: 'Vben',
      loginRoles: 'admin / user',
      username: 'vben',
    })
  })
})
