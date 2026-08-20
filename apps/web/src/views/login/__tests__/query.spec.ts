import { describe, expect, it } from 'vitest'

import { validateLoginForm } from '../query'

describe('validateLoginForm', () => {
  it('trims the username and keeps the password exact', () => {
    expect(validateLoginForm({ password: '123456', username: '  vben  ' })).toEqual({
      ok: true,
      value: { password: '123456', username: 'vben' },
    })
    expect(validateLoginForm({ password: ' 123456', username: 'vben' })).toEqual({
      ok: true,
      value: { password: ' 123456', username: 'vben' },
    })
  })

  it('rejects a blank username or password', () => {
    expect(validateLoginForm({ password: '123456', username: '   ' }).ok).toBe(false)
    expect(validateLoginForm({ password: '', username: 'vben' }).ok).toBe(false)
    expect(validateLoginForm({ password: 123456, username: 'vben' }).ok).toBe(false)
  })
})
