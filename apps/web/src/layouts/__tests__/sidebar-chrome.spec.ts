import { describe, expect, it } from 'vitest'

import {
  isIconOnlySidebar,
  isNarrowWidth,
  isSidebarExpanded,
  NARROW_MAX_WIDTH,
  sidebarChrome,
  sidebarToggleLabel,
} from '../sidebar-chrome'

describe('isNarrowWidth', () => {
  it('treats the breakpoint as inclusive', () => {
    expect(isNarrowWidth(NARROW_MAX_WIDTH)).toBe(true)
    expect(isNarrowWidth(NARROW_MAX_WIDTH + 1)).toBe(false)
    expect(isNarrowWidth(375)).toBe(true)
  })
})

describe('sidebarChrome', () => {
  it('keeps the persisted desktop collapse off the narrow drawer', () => {
    expect(sidebarChrome(false, false, true)).toBe('docked-open')
    expect(sidebarChrome(false, true, true)).toBe('docked-collapsed')
    expect(sidebarChrome(true, false, false)).toBe('drawer-closed')
    expect(sidebarChrome(true, true, true)).toBe('drawer-open')
  })

  it('labels the toggle from chrome, not from the persist flag', () => {
    expect(isSidebarExpanded('drawer-open')).toBe(true)
    expect(isIconOnlySidebar('docked-collapsed')).toBe(true)
    expect(isIconOnlySidebar('drawer-closed')).toBe(false)
    expect(sidebarToggleLabel('drawer-closed')).toBe('展开菜单')
    expect(sidebarToggleLabel('docked-open')).toBe('收起菜单')
  })
})
