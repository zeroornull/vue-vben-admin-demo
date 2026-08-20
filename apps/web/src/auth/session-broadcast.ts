export const SESSION_CHANNEL_NAME = 'vue-admin-session'

export const SESSION_CLEAR_TYPE = 'clear-session'

export type SessionClearMessage = {
  type: typeof SESSION_CLEAR_TYPE
}

export function isSessionClearMessage(value: unknown): value is SessionClearMessage {
  return Boolean(
    value &&
      typeof value === 'object' &&
      (value as { type?: unknown }).type === SESSION_CLEAR_TYPE,
  )
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

export function publishSessionClear(
  send: (data: SessionClearMessage) => void = postSessionClear,
) {
  send({ type: SESSION_CLEAR_TYPE })
}

function postSessionClear(data: SessionClearMessage) {
  if (typeof BroadcastChannel === 'undefined') return
  const channel = new BroadcastChannel(SESSION_CHANNEL_NAME)
  channel.postMessage(data)
  channel.close()
}
