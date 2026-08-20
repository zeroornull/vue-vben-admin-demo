export type AccessKind = 'action' | 'menu' | 'role'

export type AccessViewerCodes = {
  actionCodes?: string[]
  menuCodes?: string[]
  roles?: string[]
}

export function normalizeAccessCodes(value: unknown): string[] {
  if (typeof value === 'string') {
    const code = value.trim()
    return code ? [code] : []
  }
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
}

export function readAccessKind(arg: string | null | undefined): AccessKind {
  if (arg === 'menu' || arg === 'role') return arg
  return 'action'
}

export function heldCodes(
  kind: AccessKind,
  viewer: AccessViewerCodes | null | undefined,
): string[] {
  if (!viewer) return []
  if (kind === 'menu') return viewer.menuCodes ?? []
  if (kind === 'role') return viewer.roles ?? []
  return viewer.actionCodes ?? []
}

/** 数组是 OR：有一个码即可。空绑定当没权限，免得漏写值时按钮还在。 */
export function matchAccess(
  binding: { arg?: string | null; value: unknown },
  viewer: AccessViewerCodes | null | undefined,
): boolean {
  const codes = normalizeAccessCodes(binding.value)
  if (!codes.length) return false
  const held = heldCodes(readAccessKind(binding.arg), viewer)
  return codes.some((code) => held.includes(code))
}
