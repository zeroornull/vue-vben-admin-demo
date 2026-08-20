export type LoginFormValues = {
  password: string
  username: string
}

export type LoginValidation =
  | { message: string; ok: false }
  | { ok: true; value: LoginFormValues }

export function validateLoginForm(values: {
  password?: unknown
  username?: unknown
}): LoginValidation {
  const username = typeof values.username === 'string' ? values.username.trim() : ''
  const password = typeof values.password === 'string' ? values.password : ''
  if (!username) {
    return { message: '请输入用户名', ok: false }
  }
  if (!password) {
    return { message: '请输入密码', ok: false }
  }
  return { ok: true, value: { password, username } }
}
