import { describe, expect, it, vi } from 'vitest'

import { copyPathLabel, copyableFullPath, writeClipboardText } from '../copy-path'

describe('copyableFullPath', () => {
  it('keeps path and query, drops hash and off-site values', () => {
    expect(copyableFullPath('/users?name=a#top')).toBe('/users?name=a')
    expect(copyableFullPath('/')).toBe('/')
    expect(copyableFullPath('//evil.com/phish')).toBeNull()
    expect(copyableFullPath('https://example.com/users')).toBeNull()
  })
})

describe('copyPathLabel', () => {
  it('names the idle and success states', () => {
    expect(copyPathLabel(false)).toBe('复制路径')
    expect(copyPathLabel(true)).toBe('已复制')
  })
})

describe('writeClipboardText', () => {
  it('reports success and failure without throwing', async () => {
    const ok = { writeText: vi.fn().mockResolvedValue(undefined) }
    const bad = { writeText: vi.fn().mockRejectedValue(new Error('denied')) }
    await expect(writeClipboardText('/users', ok)).resolves.toBe(true)
    await expect(writeClipboardText('/users', bad)).resolves.toBe(false)
    expect(ok.writeText).toHaveBeenCalledWith('/users')
  })
})
