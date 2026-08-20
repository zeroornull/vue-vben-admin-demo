import { describe, expect, it } from 'vitest'

import { canOpenIframeExternally, iframeReloadKey, safeIframeSrc } from '../src'

describe('safeIframeSrc', () => {
  it('keeps same-origin paths and http(s) urls', () => {
    expect(safeIframeSrc('/embed-demo.html')).toBe('/embed-demo.html')
    expect(safeIframeSrc('https://example.com/docs')).toBe('https://example.com/docs')
    expect(safeIframeSrc('http://127.0.0.1:5173/x')).toBe('http://127.0.0.1:5173/x')
  })

  it('drops script, data, and protocol-relative values', () => {
    expect(safeIframeSrc('javascript:alert(1)')).toBeNull()
    expect(safeIframeSrc('data:text/html,hi')).toBeNull()
    expect(safeIframeSrc('//evil.com')).toBeNull()
    expect(safeIframeSrc('https://user:pass@evil.com')).toBeNull()
    expect(safeIframeSrc('')).toBeNull()
    expect(canOpenIframeExternally('/embed-demo.html')).toBe(true)
    expect(canOpenIframeExternally('//evil.com')).toBe(false)
    expect(canOpenIframeExternally('javascript:alert(1)')).toBe(false)
    expect(iframeReloadKey('/x', 2)).toBe('/x#2')
  })
})
