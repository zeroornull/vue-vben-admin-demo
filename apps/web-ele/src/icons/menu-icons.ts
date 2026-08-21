import { addCollection } from '@iconify/vue/offline'

import menuIconCollection from './menu-icon-collection.json'

export const menuIcons = {
  about: 'ant-design:info-circle-outlined',
  analytics: 'ant-design:bar-chart-outlined',
  audit: 'ant-design:audit-outlined',
  depts: 'ant-design:apartment-outlined',
  embed: 'ant-design:link-outlined',
  home: 'ant-design:home-outlined',
  links: 'ant-design:paper-clip-outlined',
  profile: 'ant-design:user-outlined',
  roles: 'ant-design:safety-certificate-outlined',
  users: 'ant-design:team-outlined',
  workspace: 'ant-design:appstore-outlined',
} as const

export type MenuIconName = keyof typeof menuIcons

export type MenuIconifyId = (typeof menuIcons)[MenuIconName]

let registered = false

export function registerMenuIcons() {
  if (registered) return
  addCollection(menuIconCollection)
  registered = true
}

registerMenuIcons()

export function isMenuIconName(value: unknown): value is MenuIconName {
  return typeof value === 'string' && Object.hasOwn(menuIcons, value)
}

/** 只认登记名。`mdi:home` / `TeamOutlined` / 裸 Iconify id 都不过。 */
export function resolveMenuIcon(name: string | undefined): MenuIconifyId | undefined {
  if (!name || !isMenuIconName(name)) return undefined
  return menuIcons[name]
}
