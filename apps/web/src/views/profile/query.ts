import { formatActionCodes, menuTitleByCode } from '../../access/catalog'
import { formatCodeList } from '../../layouts/user-menu'
import type { UserInfo } from '../../types/user'

export type ProfileRow = {
  key: string
  label: string
  value: string
}

export function formatMenuCodes(codes: string[]): string {
  if (!codes.length) return '无'
  return codes.map((code) => menuTitleByCode(code)).join(' / ')
}

export function profileRows(user: UserInfo): ProfileRow[] {
  return [
    { key: 'username', label: '账号', value: user.username },
    { key: 'roles', label: '登录角色', value: formatCodeList(user.roles) },
    { key: 'roleCodes', label: '业务角色', value: formatCodeList(user.roleCodes) },
    { key: 'menuCodes', label: '菜单', value: formatMenuCodes(user.menuCodes) },
    { key: 'actionCodes', label: '操作', value: formatActionCodes(user.actionCodes) },
  ]
}

export const REAL_NAME_MAX = 20

export type ProfileFormValues = {
  realName: string
}

export type ProfileValidation =
  | { message: string; ok: false }
  | { ok: true; value: ProfileFormValues }

export function formFromProfile(user: Pick<UserInfo, 'realName'>): ProfileFormValues {
  return { realName: user.realName }
}

export function validateProfileForm(values: { realName?: unknown }): ProfileValidation {
  const realName = typeof values.realName === 'string' ? values.realName.trim() : ''
  if (!realName) {
    return { message: '请输入显示名', ok: false }
  }
  if (realName.length > REAL_NAME_MAX) {
    return { message: `显示名最多 ${REAL_NAME_MAX} 个字`, ok: false }
  }
  return { ok: true, value: { realName } }
}

export const PASSWORD_MIN = 6
export const PASSWORD_MAX = 32

export type PasswordFormValues = {
  confirmPassword: string
  currentPassword: string
  newPassword: string
}

export type PasswordValidation =
  | { message: string; ok: false }
  | { ok: true; value: PasswordFormValues }

export function emptyPasswordForm(): PasswordFormValues {
  return {
    confirmPassword: '',
    currentPassword: '',
    newPassword: '',
  }
}

export function readPasswordField(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

export function validatePasswordChange(values: {
  confirmPassword?: unknown
  currentPassword?: unknown
  newPassword?: unknown
}): PasswordValidation {
  const currentPassword = readPasswordField(values.currentPassword)
  const newPassword = readPasswordField(values.newPassword)
  const confirmPassword = readPasswordField(values.confirmPassword)
  if (!currentPassword) {
    return { message: '请输入当前密码', ok: false }
  }
  if (!newPassword) {
    return { message: '请输入新密码', ok: false }
  }
  if (newPassword.length < PASSWORD_MIN || newPassword.length > PASSWORD_MAX) {
    return { message: `新密码长度 ${PASSWORD_MIN}–${PASSWORD_MAX} 位`, ok: false }
  }
  if (newPassword !== confirmPassword) {
    return { message: '两次新密码不一致', ok: false }
  }
  if (newPassword === currentPassword) {
    return { message: '新密码不能和当前密码一样', ok: false }
  }
  return { ok: true, value: { confirmPassword, currentPassword, newPassword } }
}
