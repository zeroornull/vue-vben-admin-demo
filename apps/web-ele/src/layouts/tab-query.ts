import { HOME_PATH } from '@/constants/auth'

export type AppTab = {
  affix: boolean
  fullPath: string
  icon?: string
  name: string
  title: string
  viewName: string
}

export const HOME_TAB: AppTab = {
  affix: true,
  fullPath: HOME_PATH,
  icon: 'home',
  name: 'home',
  title: '工作台',
  viewName: 'HomeView',
}

export type TabRouteInput = {
  fullPath: string
  meta?: {
    affixTab?: boolean
    icon?: string
    title?: string
    viewName?: string
  }
  name: string
}

export function tabFromRoute(route: TabRouteInput): AppTab | null {
  const title = route.meta?.title
  const viewName = route.meta?.viewName
  if (!title || !viewName) return null
  return {
    affix: Boolean(route.meta?.affixTab),
    fullPath: route.fullPath,
    icon: route.meta?.icon,
    name: route.name,
    title,
    viewName,
  }
}

/** persist 里旧页签没有 icon 时，用路由 name 去同一张登记表查 */
export function tabIconName(tab: { icon?: string; name: string }): string {
  return tab.icon || tab.name
}

export function ensureHome(tabs: AppTab[]): AppTab[] {
  if (tabs.some((tab) => tab.name === HOME_TAB.name)) return tabs
  return [HOME_TAB, ...tabs]
}

export function upsertTab(tabs: AppTab[], tab: AppTab): AppTab[] {
  const index = tabs.findIndex((item) => item.name === tab.name)
  if (index === -1) return [...tabs, tab]
  return tabs.map((item, current) =>
    current === index
      ? {
          ...item,
          ...tab,
          affix: item.affix || tab.affix,
        }
      : item,
  )
}

export function closeTab(tabs: AppTab[], name: string): AppTab[] {
  const current = tabs.find((tab) => tab.name === name)
  if (!current || current.affix) return tabs
  return tabs.filter((tab) => tab.name !== name)
}

export function closeOtherTabs(tabs: AppTab[], keepName: string): AppTab[] {
  return tabs.filter((tab) => tab.affix || tab.name === keepName)
}

export function pruneTabs(tabs: AppTab[], allowedNames: string[]): AppTab[] {
  const allowed = new Set(allowedNames)
  return tabs.filter((tab) => tab.affix || allowed.has(tab.name))
}

export function cachedViewNames(tabs: AppTab[]): string[] {
  return [...new Set(tabs.map((tab) => tab.viewName).filter(Boolean))]
}

/** 关掉当前页时回前一个；关掉别的页返回 null，表示不用跳 */
export function nextPathAfterClose(
  tabs: AppTab[],
  closedName: string,
  currentName: string,
): string | null {
  if (closedName !== currentName) return null
  const index = tabs.findIndex((tab) => tab.name === closedName)
  const remaining = closeTab(tabs, closedName)
  if (!remaining.length) return HOME_PATH
  const fallback = remaining[Math.max(0, index - 1)] ?? remaining[0]
  return fallback?.fullPath ?? HOME_PATH
}

export function closeLeftTabs(tabs: AppTab[], name: string): AppTab[] {
  const index = tabs.findIndex((tab) => tab.name === name)
  if (index < 0) return tabs
  return tabs.filter((tab, current) => tab.affix || current >= index)
}

export function closeRightTabs(tabs: AppTab[], name: string): AppTab[] {
  const index = tabs.findIndex((tab) => tab.name === name)
  if (index < 0) return tabs
  return tabs.filter((tab, current) => tab.affix || current <= index)
}

export function closeAllTabs(tabs: AppTab[]): AppTab[] {
  return tabs.filter((tab) => tab.affix)
}

export function nextPathIfMissing(
  next: AppTab[],
  currentName: string,
  preferredName?: string,
): string | null {
  if (next.some((tab) => tab.name === currentName)) return null
  const preferred = preferredName ? next.find((tab) => tab.name === preferredName) : undefined
  return (preferred ?? next.at(-1) ?? HOME_TAB).fullPath
}

export function reorderTabs(tabs: AppTab[], fromName: string, toName: string): AppTab[] {
  if (fromName === toName) return tabs
  const from = tabs.findIndex((tab) => tab.name === fromName)
  const to = tabs.findIndex((tab) => tab.name === toName)
  if (from < 0 || to < 0) return tabs
  const moving = tabs[from]
  if (!moving || moving.affix) return tabs
  const next = tabs.filter((_, index) => index !== from)
  let insert = next.findIndex((tab) => tab.name === toName)
  if (insert < 0) return tabs
  if (next[insert]?.affix) {
    insert = next.findIndex((tab) => !tab.affix)
    if (insert < 0) insert = next.length
  } else if (from < to) {
    insert += 1
  }
  next.splice(insert, 0, moving)
  return ensureHome(next)
}

export const TAB_MENU_ACTIONS = [
  'refresh',
  'close',
  'closeOthers',
  'closeLeft',
  'closeRight',
  'closeAll',
] as const

export type TabMenuAction = (typeof TAB_MENU_ACTIONS)[number]

export const TAB_MENU_LABELS: Record<TabMenuAction, string> = {
  close: '关闭',
  closeAll: '关闭全部',
  closeLeft: '关闭左侧',
  closeOthers: '关闭其他',
  closeRight: '关闭右侧',
  refresh: '刷新',
}

export function tabMenuActions(tabs: AppTab[], name: string): TabMenuAction[] {
  const index = tabs.findIndex((tab) => tab.name === name)
  const tab = index < 0 ? undefined : tabs[index]
  if (!tab) return []
  const actions: TabMenuAction[] = ['refresh']
  if (!tab.affix) actions.push('close')
  if (tabs.some((item) => !item.affix && item.name !== name)) actions.push('closeOthers')
  if (tabs.some((item, current) => current < index && !item.affix)) actions.push('closeLeft')
  if (tabs.some((item, current) => current > index && !item.affix)) actions.push('closeRight')
  if (tabs.some((item) => !item.affix)) actions.push('closeAll')
  return actions
}
