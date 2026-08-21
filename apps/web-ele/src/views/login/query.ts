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
    return { message: 'login.needUsername', ok: false }
  }
  if (!password) {
    return { message: 'login.needPassword', ok: false }
  }
  return { ok: true, value: { password, username } }
}
