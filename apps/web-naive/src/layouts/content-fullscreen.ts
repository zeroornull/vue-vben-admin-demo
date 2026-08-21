export function contentFullscreenLabel(active: boolean): string {
  return active ? '退出全屏' : '全屏'
}

export function shouldClearLayoutOverlays(
  event: Pick<KeyboardEvent, 'defaultPrevented' | 'key'>,
  locked: boolean,
): boolean {
  return event.key === 'Escape' && !event.defaultPrevented && !locked
}
