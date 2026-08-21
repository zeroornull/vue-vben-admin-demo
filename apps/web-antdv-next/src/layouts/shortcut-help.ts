export type ShortcutItem = {
  combo: string
  id: string
  note: string
  title: string
}

export const SHORTCUTS: readonly ShortcutItem[] = [
  {
    combo: 'Ctrl+K',
    id: 'search',
    note: 'Mac 用 ⌘K。↑↓ / Home/End 选，空着时 1-9 跳第几条，0 跳第 10 条。',
    title: '搜索菜单',
  },
  {
    combo: '?',
    id: 'help',
    note: 'Ctrl+/ 也能开。输入框里打问号不会开。',
    title: '快捷键说明',
  },
  {
    combo: 'Esc',
    id: 'escape',
    note: '搜索、说明、外观、用户菜单、全屏、抽屉。锁屏要先解锁。',
    title: '关掉最上面一层',
  },
]

const TEXT_INPUT_TYPES = new Set([
  'email',
  'number',
  'password',
  'search',
  'tel',
  'text',
  'url',
])

export function isEditableTag(
  tagName: string,
  contentEditable: boolean,
  inputType = 'text',
): boolean {
  if (contentEditable) return true
  const tag = tagName.toUpperCase()
  if (tag === 'TEXTAREA' || tag === 'SELECT') return true
  if (tag === 'INPUT') return TEXT_INPUT_TYPES.has(inputType.toLowerCase())
  return false
}

export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const inputType = target instanceof HTMLInputElement ? target.type : 'text'
  return isEditableTag(target.tagName, target.isContentEditable, inputType)
}

export function isHelpHotkey(event: {
  altKey: boolean
  ctrlKey: boolean
  key: string
  metaKey: boolean
}): boolean {
  if (event.altKey) return false
  if (event.key === '?' && !event.ctrlKey && !event.metaKey) return true
  return (event.ctrlKey || event.metaKey) && event.key === '/'
}

export function shouldHandleHelpHotkey(
  event: {
    altKey: boolean
    ctrlKey: boolean
    defaultPrevented: boolean
    key: string
    metaKey: boolean
  },
  state: { locked: boolean; typing: boolean },
): boolean {
  if (event.defaultPrevented || state.locked) return false
  if (!isHelpHotkey(event)) return false
  if (event.key === '?' && state.typing) return false
  return true
}

export function shouldCloseHelpOnEscape(
  event: Pick<KeyboardEvent, 'defaultPrevented' | 'key'>,
  open: boolean,
  locked = false,
): boolean {
  return open && !locked && event.key === 'Escape' && !event.defaultPrevented
}
