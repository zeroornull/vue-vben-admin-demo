import { afterEach, describe, expect, it } from 'vitest'

import { clearSkin, getSkin } from '@app/core'

import { createNaiveSkin, initNaiveSkin, naiveControlSize } from '../naive'

afterEach(() => {
  clearSkin()
})

describe('naiveControlSize', () => {
  it('maps chrome density to NConfigProvider size', () => {
    expect(naiveControlSize('comfortable')).toBe('medium')
    expect(naiveControlSize('compact')).toBe('small')
  })
})

describe('initNaiveSkin', () => {
  it('registers naive without importing it into @app/core', () => {
    initNaiveSkin()
    const skin = getSkin()
    expect(skin?.name).toBe('naive')
    expect(skin?.controlSize('compact')).toBe('small')
    expect(createNaiveSkin().Form).toBeTruthy()
  })
})
