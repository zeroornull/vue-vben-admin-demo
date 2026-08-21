export function readRouteTitle(meta: { title?: unknown }): string {
  return typeof meta.title === 'string' ? meta.title.trim() : ''
}

export function documentTitle(pageTitle: string, appName: string): string {
  if (!pageTitle || pageTitle === appName) return appName
  return `${pageTitle} · ${appName}`
}

export function applyDocumentTitle(target: { title: string }, title: string) {
  target.title = title
}
