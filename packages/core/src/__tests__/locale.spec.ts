import { describe, expect, it } from 'vitest'

import { applyHtmlLang, nextLocale, normalizeLocale, readStoredLocale } from '../locale.ts'

describe('normalizeLocale / nextLocale', () => {
  it('falls back to zh-CN', () => {
    expect(normalizeLocale('nope')).toBe('zh-CN')
    expect(normalizeLocale('en-US')).toBe('en-US')
  })

  it('cycles zh-CN → en-US → zh-CN', () => {
    expect(nextLocale('zh-CN')).toBe('en-US')
    expect(nextLocale('en-US')).toBe('zh-CN')
  })
})

describe('applyHtmlLang / readStoredLocale', () => {
  it('writes lang and reads persist payload', () => {
    const root = { lang: '' }
    applyHtmlLang(root, 'en-US')
    expect(root.lang).toBe('en-US')
    expect(readStoredLocale(null)).toBe('zh-CN')
    expect(readStoredLocale('{')).toBe('zh-CN')
    expect(readStoredLocale('{"themeMode":"dark","locale":"en-US"}')).toBe('en-US')
  })
})
