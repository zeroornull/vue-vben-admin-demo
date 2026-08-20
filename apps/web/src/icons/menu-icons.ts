import type { Component } from 'vue'
import {
  ApartmentOutlined,
  AppstoreOutlined,
  BarChartOutlined,
  HomeOutlined,
  InfoCircleOutlined,
  LinkOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons-vue'

export const menuIcons = {
  about: InfoCircleOutlined,
  analytics: BarChartOutlined,
  depts: ApartmentOutlined,
  embed: LinkOutlined,
  home: HomeOutlined,
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
