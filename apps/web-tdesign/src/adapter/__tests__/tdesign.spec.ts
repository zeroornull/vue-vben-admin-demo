import { afterEach, describe, expect, it } from 'vitest'

import { clearSkin, getSkin } from '@app/core'

import { createTdesignSkin, initTdesignSkin, tdesignControlSize } from '../tdesign'

afterEach(() => {
  clearSkin()
})

describe('tdesignControlSize', () => {
  it('maps chrome density to TDesign size', () => {
    expect(tdesignControlSize('comfortable')).toBe('medium')
    expect(tdesignControlSize('compact')).toBe('small')
  })
})

describe('initTdesignSkin', () => {
  it('registers tdesign without importing it into @app/core', () => {
    initTdesignSkin()
    const skin = getSkin()
    expect(skin?.name).toBe('tdesign')
    expect(skin?.controlSize('compact')).toBe('small')
    expect(createTdesignSkin().Form).toBeTruthy()
  })
})
