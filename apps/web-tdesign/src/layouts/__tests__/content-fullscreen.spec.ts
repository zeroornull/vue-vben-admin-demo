import { describe, expect, it } from 'vitest'

import { contentFullscreenLabel, shouldClearLayoutOverlays } from '../content-fullscreen'

describe('contentFullscreenLabel', () => {
  it('names the enter and exit actions', () => {
    expect(contentFullscreenLabel(false)).toBe('全屏')
    expect(contentFullscreenLabel(true)).toBe('退出全屏')
  })
})

describe('shouldClearLayoutOverlays', () => {
  it('exits only on a free Escape while unlocked', () => {
    expect(shouldClearLayoutOverlays({ key: 'Escape', defaultPrevented: false }, false)).toBe(true)
    expect(shouldClearLayoutOverlays({ key: 'Escape', defaultPrevented: true }, false)).toBe(false)
    expect(shouldClearLayoutOverlays({ key: 'Escape', defaultPrevented: false }, true)).toBe(false)
    expect(shouldClearLayoutOverlays({ key: 'Enter', defaultPrevented: false }, false)).toBe(false)
  })
})
