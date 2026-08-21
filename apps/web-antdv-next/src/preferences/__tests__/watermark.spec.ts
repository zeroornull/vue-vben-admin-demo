import { describe, expect, it } from 'vitest'

import {
  escapeXml,
  shouldShowWatermark,
  watermarkText,
  watermarkTileUrl,
} from '../watermark'

describe('watermarkText', () => {
  it('is empty without a session', () => {
    expect(watermarkText(null)).toBe('')
    expect(watermarkText({ realName: 'Vben', username: '' })).toBe('')
  })

  it('uses username when the display name is empty or the same', () => {
    expect(watermarkText({ realName: '  ', username: 'vben' })).toBe('vben')
    expect(watermarkText({ realName: 'vben', username: 'vben' })).toBe('vben')
  })

  it('joins display name and username', () => {
    expect(watermarkText({ realName: 'Vben', username: 'vben' })).toBe('Vben · vben')
  })
})

describe('shouldShowWatermark', () => {
  it('needs both the preference and some text', () => {
    expect(shouldShowWatermark(true, 'Vben · vben')).toBe(true)
    expect(shouldShowWatermark(false, 'Vben · vben')).toBe(false)
    expect(shouldShowWatermark(true, '')).toBe(false)
  })
})

describe('escapeXml / watermarkTileUrl', () => {
  it('escapes markup before building the tile', () => {
    expect(escapeXml(`<"&'>`)).toBe('&lt;&quot;&amp;&apos;&gt;')
    const url = watermarkTileUrl('A & B', false)
    expect(url).toContain('data:image/svg+xml')
    expect(url).not.toContain('A & B')
    expect(decodeURIComponent(url)).toContain('A &amp; B')
  })
})
