import { describe, expect, it } from 'vitest'

import { shouldClosePopover } from '../popover'

describe('shouldClosePopover', () => {
  it('closes only on an outside click while open', () => {
    const root = document.createElement('div')
    const inside = document.createElement('button')
    root.append(inside)

    expect(shouldClosePopover({ target: inside }, root, true)).toBe(false)
    expect(shouldClosePopover({ target: document.body }, root, true)).toBe(true)
    expect(shouldClosePopover({ target: document.body }, root, false)).toBe(false)
    expect(shouldClosePopover({ target: inside }, null, true)).toBe(false)
  })
})
