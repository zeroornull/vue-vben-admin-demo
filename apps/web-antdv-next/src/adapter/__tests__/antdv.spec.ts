import { afterEach, describe, expect, it } from 'vitest'

import { clearSkin, getSkin } from '@app/core'

import { antdvControlSize, createAntdvSkin, initAntdvSkin } from '../antdv'

afterEach(() => {
  clearSkin()
})

describe('antdvControlSize', () => {
  it('maps chrome density to ConfigProvider size', () => {
    expect(antdvControlSize('comfortable')).toBe('middle')
    expect(antdvControlSize('compact')).toBe('small')
  })
})

describe('initAntdvSkin', () => {
  it('registers antdv-next without importing it into @app/core', () => {
    initAntdvSkin()
    const skin = getSkin()
    expect(skin?.name).toBe('antdv-next')
    expect(skin?.controlSize('compact')).toBe('small')
    expect(createAntdvSkin().Form).toBeTruthy()
  })
})
