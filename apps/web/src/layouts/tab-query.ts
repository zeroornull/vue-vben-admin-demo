import { HOME_PATH } from '@/constants/auth'

export type AppTab = {
  affix: boolean
  fullPath: string
  name: string
  title: string
  viewName: string
}

export const HOME_TAB: AppTab = {
  affix: true,
  fullPath: HOME_PATH,
  name: 'home',
  title: '工作台',
  viewName: 'HomeView',
}

export type TabRouteInput = {
  fullPath: string
  meta?: {
    affixTab?: boolean
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
    name: route.name,
    title,
    viewName,
  }
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
