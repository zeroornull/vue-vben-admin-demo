export const VERSION_POLL_MS = 60_000

export const INITIAL_BUILD_ID = 'dev-1'

export function hasNewBuild(loaded: string, latest: string): boolean {
  return Boolean(loaded && latest && loaded !== latest)
}

export function shouldPollVersion(hidden: boolean, locked: boolean): boolean {
  return !hidden && !locked
}

export function nextBuildId(current: string): string {
  const match = /^(.*?)(\d+)$/.exec(current.trim())
  if (!match) return `${current.trim() || 'dev'}-2`
  return `${match[1]}${Number(match[2]) + 1}`
}
