import { describe, expect, it } from 'vitest'

import {
  SHORTCUTS,
  isEditableTag,
  isHelpHotkey,
  shouldCloseHelpOnEscape,
  shouldHandleHelpHotkey,
} from '../shortcut-help'

const helpKey = {
  altKey: false,
  ctrlKey: false,
  defaultPrevented: false,
  key: '?',
  metaKey: false,
}

const slashChord = {
  altKey: false,
  ctrlKey: true,
  defaultPrevented: false,
  key: '/',
  metaKey: false,
}

describe('SHORTCUTS', () => {
  it('lists the keys that already exist', () => {
    expect(SHORTCUTS.map((item) => item.id)).toEqual(['search', 'help', 'escape'])
  })
})

describe('isEditableTag', () => {
  it('treats text fields as typing, not buttons', () => {
    expect(isEditableTag('INPUT', false, 'search')).toBe(true)
    expect(isEditableTag('TEXTAREA', false)).toBe(true)
    expect(isEditableTag('INPUT', false, 'button')).toBe(false)
    expect(isEditableTag('BUTTON', false)).toBe(false)
    expect(isEditableTag('DIV', true)).toBe(true)
  })
})

describe('shouldHandleHelpHotkey', () => {
  it('opens on ? or Ctrl+/ when unlocked', () => {
    expect(isHelpHotkey(helpKey)).toBe(true)
    expect(isHelpHotkey(slashChord)).toBe(true)
    expect(isHelpHotkey({ ...helpKey, key: '/' })).toBe(false)
    expect(shouldHandleHelpHotkey(helpKey, { locked: false, typing: false })).toBe(true)
    expect(shouldHandleHelpHotkey(slashChord, { locked: false, typing: true })).toBe(true)
  })

  it('ignores ? while typing, locked, or already handled', () => {
    expect(shouldHandleHelpHotkey(helpKey, { locked: false, typing: true })).toBe(false)
    expect(shouldHandleHelpHotkey(helpKey, { locked: true, typing: false })).toBe(false)
    expect(
      shouldHandleHelpHotkey({ ...helpKey, defaultPrevented: true }, { locked: false, typing: false }),
    ).toBe(false)
  })
})

describe('shouldCloseHelpOnEscape', () => {
  it('closes only a free Escape while the overlay is open', () => {
    expect(shouldCloseHelpOnEscape({ key: 'Escape', defaultPrevented: false }, true)).toBe(true)
    expect(shouldCloseHelpOnEscape({ key: 'Escape', defaultPrevented: true }, true)).toBe(false)
    expect(shouldCloseHelpOnEscape({ key: 'Escape', defaultPrevented: false }, false)).toBe(false)
    expect(shouldCloseHelpOnEscape({ key: 'Escape', defaultPrevented: false }, true, true)).toBe(false)
  })
})
