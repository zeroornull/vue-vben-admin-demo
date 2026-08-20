import { canAccessRoute } from '@/access/resolve'
import { HOME_PATH } from '@/constants/auth'

import { matchLayoutChild } from './dynamic-access'

export type LastRouteViewer = {
  menuCodes: string[]
  roles: string[]
  username: string
}

export type LastRouteMap = Record<string, string>

export function rememberableLayoutPath(path: string): string | null {
  if (!path.startsWith('/') || path.startsWith('//')) return null
  const clean = path.split('?')[0]?.split('#')[0] ?? ''
  const matched = matchLayoutChild(clean)
  if (!matched) return null
  if (matched.path.includes(':')) return clean
  return matched.path === '' ? HOME_PATH : `/${matched.path}`
}

export function rememberInMap(
  map: LastRouteMap,
  path: string,
  username: string,
): LastRouteMap {
  const remembered = rememberableLayoutPath(path)
  const owner = username.trim()
  if (!owner || !remembered) return map
  if (map[owner] === remembered) return map
  return { ...map, [owner]: remembered }
}

export function lastPathFor(map: LastRouteMap, username: string): string | null {
  const owner = username.trim()
  if (!owner) return null
  return rememberableLayoutPath(map[owner] ?? '')
}

export function resolveLoginLanding(
  redirect: unknown,
  lastPath: string | null,
  user: LastRouteViewer,
): string {
  const candidates = [
    typeof redirect === 'string' ? rememberableLayoutPath(redirect) : null,
    lastPath ? rememberableLayoutPath(lastPath) : null,
  ]
  for (const path of candidates) {
    if (!path) continue
    if (path === HOME_PATH) return HOME_PATH
    const route = matchLayoutChild(path)
    if (route && canAccessRoute({ meta: route.meta ?? {} }, user)) return path
  }
  return HOME_PATH
}
