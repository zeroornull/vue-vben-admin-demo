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
