export type NavLayout = 'sidebar' | 'top'

export const navLayouts: NavLayout[] = ['sidebar', 'top']

export const navLayoutLabels: Record<NavLayout, string> = {
  sidebar: '侧栏',
  top: '顶栏',
}

export function isNavLayout(value: unknown): value is NavLayout {
  return value === 'sidebar' || value === 'top'
}

export function normalizeNavLayout(value: unknown): NavLayout {
  return isNavLayout(value) ? value : 'sidebar'
}

export function nextNavLayout(layout: NavLayout): NavLayout {
  const index = navLayouts.indexOf(layout)
  return navLayouts[(index + 1) % navLayouts.length] ?? 'sidebar'
}
