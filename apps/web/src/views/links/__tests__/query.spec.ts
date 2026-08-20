import { describe, expect, it } from 'vitest'

import {
  extraLinkMenuItems,
  isReservedLinkCode,
  linkSrcFor,
  validateLinkForm,
} from '../query'

describe('validateLinkForm / extraLinkMenuItems', () => {
  it('rejects reserved codes and unsafe src, and only lists enabled links when embed is granted', () => {
    expect(isReservedLinkCode('users')).toBe(true)
    expect(isReservedLinkCode('docs')).toBe(false)
    expect(validateLinkForm({ code: 'users', iframeSrc: '/embed-demo.html', status: 1, title: '文档' }).ok).toBe(
      false,
    )
    expect(validateLinkForm({ code: 'docs', iframeSrc: 'javascript:alert(1)', status: 1, title: '文档' }).ok).toBe(
      false,
    )
    expect(validateLinkForm({ code: 'docs', iframeSrc: '/embed-demo.html', status: 1, title: '文档' })).toEqual({
      ok: true,
      value: { code: 'docs', iframeSrc: '/embed-demo.html', status: 1, title: '文档' },
    })
    const links = [
      {
        code: 'docs',
        createTime: '2026-08-20 10:00:00',
        id: 'l-1',
        iframeSrc: '/embed-demo.html',
        status: 1 as const,
        title: '演示文档',
      },
      {
        code: 'off',
        createTime: '2026-08-20 11:00:00',
        id: 'l-2',
        iframeSrc: '/embed-demo.html',
        status: 0 as const,
        title: '关掉',
      },
    ]
    expect(extraLinkMenuItems(links, false)).toEqual([])
    expect(extraLinkMenuItems(links, true).map((item) => item.path)).toEqual(['/embed/docs'])
    expect(linkSrcFor(links, 'off')).toBeNull()
    expect(linkSrcFor(links, 'docs')).toBe('/embed-demo.html')
  })
})
