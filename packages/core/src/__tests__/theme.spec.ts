import { describe, expect, it } from 'vitest'

import {
  applyThemeDataset,
  nextThemeMode,
  normalizeThemeMode,
  readStoredThemeMode,
  resolveTheme,
} from '../theme.ts'

describe('normalizeThemeMode / resolveTheme', () => {
  it('falls back to system', () => {
    expect(normalizeThemeMode('nope')).toBe('system')
    expect(normalizeThemeMode('dark')).toBe('dark')
  })

  it('follows the OS only in system mode', () => {
    expect(resolveTheme('system', true)).toBe('dark')
    expect(resolveTheme('system', false)).toBe('light')
    expect(resolveTheme('light', true)).toBe('light')
    expect(resolveTheme('dark', false)).toBe('dark')
  })
})

describe('nextThemeMode / readStoredThemeMode', () => {
  it('cycles system → light → dark → system', () => {
    expect(nextThemeMode('system')).toBe('light')
    expect(nextThemeMode('light')).toBe('dark')
    expect(nextThemeMode('dark')).toBe('system')
  })

  it('reads the pinia persist payload', () => {
    expect(readStoredThemeMode(null)).toBe('system')
    expect(readStoredThemeMode('{')).toBe('system')
    expect(readStoredThemeMode('{"sidebarCollapsed":true,"themeMode":"dark"}')).toBe('dark')
  })
})

describe('applyThemeDataset', () => {
  it('writes data-theme', () => {
    const root = { dataset: {} as DOMStringMap }
    applyThemeDataset(root, 'dark')
    expect(root.dataset.theme).toBe('dark')
  })
})
