import { describe, expect, it } from 'vitest'

import { unwrapBody } from '../unwrap.ts'

describe('unwrapBody', () => {
  it('returns data when code is 0', () => {
    expect(unwrapBody({ code: 0, data: { accessToken: 't' }, message: 'ok' })).toEqual({
      accessToken: 't',
    })
  })

  it('throws the server message otherwise', () => {
    expect(() =>
      unwrapBody({ code: 1, data: null, message: '账号或密码错误' }),
    ).toThrow('账号或密码错误')
  })
})
