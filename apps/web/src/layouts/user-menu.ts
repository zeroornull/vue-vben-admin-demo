export type UserMenuSource = {
  realName: string
  roleCodes: string[]
  roles: string[]
  username: string
}

export type UserMenuMeta = {
  bizRoles: string
  initial: string
  label: string
  loginRoles: string
  username: string
}

export function userInitial(name: string): string {
  const text = name.trim()
  return text ? [...text][0] ?? '?' : '?'
}

export function formatCodeList(codes: string[]): string {
  return codes.length ? codes.join(' / ') : '无'
}

export function userMenuMeta(user: UserMenuSource | null | undefined): UserMenuMeta | null {
  if (!user) return null
  const label = user.realName.trim() || user.username
  return {
    bizRoles: formatCodeList(user.roleCodes),
    initial: userInitial(label),
    label,
    loginRoles: formatCodeList(user.roles),
    username: user.username,
  }
}
