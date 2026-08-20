export const NARROW_MAX_WIDTH = 768

export const NARROW_MEDIA_QUERY = `(max-width: ${NARROW_MAX_WIDTH}px)`

export type SidebarChrome = 'docked-open' | 'docked-collapsed' | 'drawer-open' | 'drawer-closed'

export function isNarrowWidth(width: number, max = NARROW_MAX_WIDTH): boolean {
  return width <= max
}

export function sidebarChrome(
  narrow: boolean,
  collapsed: boolean,
  drawerOpen: boolean,
): SidebarChrome {
  if (narrow) return drawerOpen ? 'drawer-open' : 'drawer-closed'
  return collapsed ? 'docked-collapsed' : 'docked-open'
}

export function isSidebarExpanded(chrome: SidebarChrome): boolean {
  return chrome === 'docked-open' || chrome === 'drawer-open'
}

export function isIconOnlySidebar(chrome: SidebarChrome): boolean {
  return chrome === 'docked-collapsed'
}

export function sidebarToggleLabel(chrome: SidebarChrome): string {
  return isSidebarExpanded(chrome) ? '收起菜单' : '展开菜单'
}
