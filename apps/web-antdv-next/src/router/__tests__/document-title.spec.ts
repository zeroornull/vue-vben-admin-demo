import { describe, expect, it } from 'vitest'

import { applyDocumentTitle, documentTitle, readRouteTitle } from '../document-title'

describe('readRouteTitle / documentTitle', () => {
  it('only accepts a trimmed string title', () => {
    expect(readRouteTitle({ title: ' 用户 ' })).toBe('用户')
    expect(readRouteTitle({})).toBe('')
    expect(readRouteTitle({ title: 1 })).toBe('')
  })

  it('joins the page and the app name', () => {
    expect(documentTitle('', 'Vue Admin')).toBe('Vue Admin')
    expect(documentTitle('Vue Admin', 'Vue Admin')).toBe('Vue Admin')
    expect(documentTitle('用户', 'Vue Admin')).toBe('用户 · Vue Admin')
  })
})

describe('applyDocumentTitle', () => {
  it('writes the computed title onto the document-like target', () => {
    const target = { title: 'old' }
    applyDocumentTitle(target, documentTitle('登录', 'Vue Admin'))
    expect(target.title).toBe('登录 · Vue Admin')
  })
})
