import { formatActionCodes, menuTitleByCode } from '@/access/catalog'
import { formatCodeList } from '@/layouts/user-menu'
import type { UserInfo } from '@/types/user'

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
    { key: 'realName', label: '显示名', value: user.realName },
    { key: 'roles', label: '登录角色', value: formatCodeList(user.roles) },
    { key: 'roleCodes', label: '业务角色', value: formatCodeList(user.roleCodes) },
    { key: 'menuCodes', label: '菜单', value: formatMenuCodes(user.menuCodes) },
    { key: 'actionCodes', label: '操作', value: formatActionCodes(user.actionCodes) },
  ]
}
