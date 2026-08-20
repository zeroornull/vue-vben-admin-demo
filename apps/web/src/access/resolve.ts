import type { RouteRecordRaw } from 'vue-router'

import {
  isActionCode,
  isMenuCode,
  parentMenuOfAction,
  type ActionCode,
  type MenuCode,
} from './catalog'

export type AccessViewer = {
  menuCodes: string[]
  roles: string[]
}

function readMenuCode(meta: unknown): string | undefined {
  if (!meta || typeof meta !== 'object') return undefined
  const code = (meta as { menuCode?: unknown }).menuCode
  return typeof code === 'string' ? code : undefined
}

function readRequiredRoles(meta: unknown): string[] {
  if (!meta || typeof meta !== 'object') return []
  const roles = (meta as { roles?: unknown }).roles
  return Array.isArray(roles) ? roles.filter((item): item is string => typeof item === 'string') : []
}

export type RoleMenuSource = {
  actionCodes?: string[]
  code: string
  menuCodes: string[]
  status: 0 | 1
}

export function uniqueCodes(codes: string[]): string[] {
  return [...new Set(codes)]
}

export function sanitizeMenuCodes(input: unknown): MenuCode[] {
  if (!Array.isArray(input)) return []
  return uniqueCodes(input.map((item) => String(item))).filter(isMenuCode)
}

export function sanitizeActionCodes(input: unknown): ActionCode[] {
  if (!Array.isArray(input)) return []
  return uniqueCodes(input.map((item) => String(item))).filter(isActionCode)
}

export function grantParentMenus(menuCodes: string[], actionCodes: string[]): MenuCode[] {
  const next = new Set(sanitizeMenuCodes(menuCodes))
  for (const code of sanitizeActionCodes(actionCodes)) {
    const parent = parentMenuOfAction(code)
    if (parent) next.add(parent)
  }
  return [...next]
}

export function dropActionsForMenu(actionCodes: string[], menuCode: string): ActionCode[] {
  return sanitizeActionCodes(actionCodes).filter((code) => parentMenuOfAction(code) !== menuCode)
}

export function hasAccessCode(codes: string[], code: string): boolean {
  return codes.includes(code)
}

export function resolveMenuCodes(roleCodes: string[], roles: RoleMenuSource[]): MenuCode[] {
  const wanted = new Set(roleCodes)
  const granted = new Set<MenuCode>()
  for (const role of roles) {
    if (!wanted.has(role.code) || role.status !== 1) continue
    for (const code of sanitizeMenuCodes(role.menuCodes)) {
      granted.add(code)
    }
  }
  return [...granted]
}

export function resolveActionCodes(roleCodes: string[], roles: RoleMenuSource[]): ActionCode[] {
  const wanted = new Set(roleCodes)
  const granted = new Set<ActionCode>()
  for (const role of roles) {
    if (!wanted.has(role.code) || role.status !== 1) continue
    for (const code of sanitizeActionCodes(role.actionCodes)) {
      granted.add(code)
    }
  }
  return [...granted]
}

export function canAccessRoute(route: { meta?: unknown }, viewer: AccessViewer): boolean {
  const code = readMenuCode(route.meta)
  if (code && !viewer.menuCodes.includes(code)) {
    return false
  }
  const required = readRequiredRoles(route.meta)
  if (required.length && !required.some((role) => viewer.roles.includes(role))) {
    return false
  }
  return true
}

export function filterDynamicRoutes(
  routes: RouteRecordRaw[],
  viewer: AccessViewer,
): RouteRecordRaw[] {
  return routes.filter((route) => canAccessRoute(route, viewer))
}
