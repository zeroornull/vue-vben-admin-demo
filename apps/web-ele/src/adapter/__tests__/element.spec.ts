import { afterEach, describe, expect, it } from 'vitest'

import { clearSkin, getSkin } from '@app/core'

import { createElementSkin, elementControlSize, initElementSkin } from '../element'

afterEach(() => {
  clearSkin()
})

describe('elementControlSize', () => {
  it('maps chrome density to ConfigProvider size', () => {
    expect(elementControlSize('comfortable')).toBe('default')
    expect(elementControlSize('compact')).toBe('small')
  })
})

describe('initElementSkin', () => {
  it('registers element without importing it into @app/core', () => {
    initElementSkin()
    const skin = getSkin()
    expect(skin?.name).toBe('element')
    expect(skin?.controlSize('compact')).toBe('small')
    expect(createElementSkin().Form).toBeTruthy()
  })
})
