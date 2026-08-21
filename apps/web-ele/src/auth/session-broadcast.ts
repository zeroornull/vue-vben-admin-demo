export const SESSION_CHANNEL_NAME = 'vue-admin-session'
export const AUTH_PERSIST_KEY = 'auth'

export const SESSION_CLEAR_TYPE = 'clear-session'
export const SESSION_LOCK_TYPE = 'lock'
export const SESSION_UNLOCK_TYPE = 'unlock'
export const SESSION_ADOPT_TYPE = 'adopt-session'

export type SessionMessage =
  | { type: typeof SESSION_CLEAR_TYPE }
  | { type: typeof SESSION_LOCK_TYPE }
  | { type: typeof SESSION_UNLOCK_TYPE }
  | { type: typeof SESSION_ADOPT_TYPE }

const sessionTypes = new Set<string>([
  SESSION_ADOPT_TYPE,
  SESSION_CLEAR_TYPE,
  SESSION_LOCK_TYPE,
  SESSION_UNLOCK_TYPE,
])

export function isSessionMessage(value: unknown): value is SessionMessage {
  return Boolean(
    value &&
      typeof value === 'object' &&
      sessionTypes.has(String((value as { type?: unknown }).type)),
  )
}

export function isSessionClearMessage(value: unknown): value is { type: typeof SESSION_CLEAR_TYPE } {
  return isSessionMessage(value) && value.type === SESSION_CLEAR_TYPE
}

export function shouldPublishSessionClear(
  hadToken: boolean,
  options?: { broadcast?: boolean },
): boolean {
  return hadToken && options?.broadcast !== false
}

export function shouldApplyRemoteSessionClear(accessToken: string): boolean {
  return Boolean(accessToken)
}

export function shouldApplyRemoteLock(locked: boolean): boolean {
  return !locked
}

export function shouldApplyRemoteUnlock(locked: boolean): boolean {
  return locked
}

export function readStoredAccessToken(raw: string | null): string {
  if (!raw) return ''
  try {
    const parsed = JSON.parse(raw) as { accessToken?: unknown }
    return typeof parsed.accessToken === 'string' ? parsed.accessToken : ''
  } catch {
    return ''
  }
}

export function shouldAdoptRemoteSession(localToken: string, persistedToken: string): boolean {
  return Boolean(persistedToken) && localToken !== persistedToken
}

export function publishSessionMessage(
  data: SessionMessage,
  send: (data: SessionMessage) => void = postSessionMessage,
) {
  send(data)
}

export function publishSessionClear(
  send: (data: SessionMessage) => void = postSessionMessage,
) {
  publishSessionMessage({ type: SESSION_CLEAR_TYPE }, send)
}

function postSessionMessage(data: SessionMessage) {
  if (typeof BroadcastChannel === 'undefined') return
  const channel = new BroadcastChannel(SESSION_CHANNEL_NAME)
  channel.postMessage(data)
  channel.close()
}
