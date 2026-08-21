export function readViewName(meta: { viewName?: unknown }): string {
  return typeof meta.viewName === 'string' ? meta.viewName : ''
}

export function excludeCachedName(names: string[], viewName: string): string[] {
  if (!viewName) return names
  return names.filter((name) => name !== viewName)
}

export function viewInstanceKey(routeName: unknown, epoch: number): string {
  return `${String(routeName)}:${epoch}`
}
