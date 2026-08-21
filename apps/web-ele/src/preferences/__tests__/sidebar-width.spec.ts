import { describe, expect, it } from 'vitest'

import {
  readStoredSidebarWidth,
  SIDEBAR_WIDTH_DEFAULT,
  SIDEBAR_WIDTH_MAX,
  SIDEBAR_WIDTH_MIN,
  sidebarWidthByKey,
  sidebarWidthFromDrag,
  normalizeSidebarWidth,
} from '../sidebar-width'

describe('normalizeSidebarWidth', () => {
  it('clamps, rounds, and falls back to 220', () => {
    expect(normalizeSidebarWidth(220)).toBe(220)
    expect(normalizeSidebarWidth(220.4)).toBe(220)
    expect(normalizeSidebarWidth(100)).toBe(SIDEBAR_WIDTH_MIN)
    expect(normalizeSidebarWidth(900)).toBe(SIDEBAR_WIDTH_MAX)
    expect(normalizeSidebarWidth('280')).toBe(280)
    expect(normalizeSidebarWidth('nope')).toBe(SIDEBAR_WIDTH_DEFAULT)
    expect(normalizeSidebarWidth(Number.NaN)).toBe(SIDEBAR_WIDTH_DEFAULT)
  })
})

describe('sidebarWidthFromDrag / sidebarWidthByKey', () => {
  it('moves from the pointer delta and keyboard steps', () => {
    expect(sidebarWidthFromDrag(220, 100, 140)).toBe(260)
    expect(sidebarWidthFromDrag(220, 100, 10)).toBe(SIDEBAR_WIDTH_MIN)
    expect(sidebarWidthByKey(220, 'ArrowRight')).toBe(228)
    expect(sidebarWidthByKey(220, 'ArrowLeft')).toBe(212)
    expect(sidebarWidthByKey(220, 'Home')).toBe(SIDEBAR_WIDTH_MIN)
    expect(sidebarWidthByKey(220, 'End')).toBe(SIDEBAR_WIDTH_MAX)
    expect(sidebarWidthByKey(220, 'Escape')).toBeNull()
  })
})

describe('readStoredSidebarWidth', () => {
  it('reads the pinia persist payload', () => {
    expect(readStoredSidebarWidth(null)).toBe(SIDEBAR_WIDTH_DEFAULT)
    expect(readStoredSidebarWidth('{')).toBe(SIDEBAR_WIDTH_DEFAULT)
    expect(readStoredSidebarWidth('{"sidebarCollapsed":true,"sidebarWidth":300}')).toBe(300)
  })
})
