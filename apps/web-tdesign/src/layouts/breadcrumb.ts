export type Crumb = {
  current: boolean
  /** 有 name 才能跳；分组标题没有对应路由 */
  name?: string
  title: string
}

export type CrumbRoute = {
  meta?: {
    group?: string
    title?: string
  }
  name: string
}

export const HOME_CRUMB = { name: 'home', title: '工作台' } as const

export function crumbsFromRoute(
  route: CrumbRoute,
  home: { name: string; title: string } = HOME_CRUMB,
): Crumb[] {
  const title = route.meta?.title
  if (!title) return []
  if (route.name === home.name) {
    return [{ current: true, title: home.title }]
  }
  const crumbs: Crumb[] = [{ current: false, name: home.name, title: home.title }]
  if (route.meta?.group) {
    crumbs.push({ current: false, title: route.meta.group })
  }
  crumbs.push({ current: true, title })
  return crumbs
}

export function shouldShowCrumbs(crumbs: Crumb[]): boolean {
  return crumbs.length > 1
}
