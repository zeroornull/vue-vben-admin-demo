import type { Component } from 'vue'
import {
  ApartmentOutlined,
  AppstoreOutlined,
  AuditOutlined,
  BarChartOutlined,
  HomeOutlined,
  InfoCircleOutlined,
  LinkOutlined,
  PaperClipOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons-vue'

export const menuIcons = {
  about: InfoCircleOutlined,
  analytics: BarChartOutlined,
  audit: AuditOutlined,
  depts: ApartmentOutlined,
  embed: LinkOutlined,
  home: HomeOutlined,
  links: PaperClipOutlined,
  profile: UserOutlined,
  roles: SafetyCertificateOutlined,
  users: TeamOutlined,
  workspace: AppstoreOutlined,
} as const

export type MenuIconName = keyof typeof menuIcons

export function isMenuIconName(value: string): value is MenuIconName {
  return Object.hasOwn(menuIcons, value)
}

export function resolveMenuIcon(name: string | undefined): Component | undefined {
  if (!name || !isMenuIconName(name)) return undefined
  return menuIcons[name]
}
