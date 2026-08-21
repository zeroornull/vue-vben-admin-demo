import { afterEach, describe, expect, it } from 'vitest'

import { clearSkin, getSkin } from '@app/core'

import { antdControlSize, createAntdSkin, initAntdSkin } from '../antd'

afterEach(() => {
  clearSkin()
})

describe('antdControlSize', () => {
  it('maps chrome density to ConfigProvider size', () => {
    expect(antdControlSize('comfortable')).toBe('middle')
    expect(antdControlSize('compact')).toBe('small')
  })
})

describe('initAntdSkin', () => {
  it('registers antd without importing it into @app/core', () => {
    initAntdSkin()
    const skin = getSkin()
    expect(skin?.name).toBe('antd')
    expect(skin?.controlSize('compact')).toBe('small')
    expect(createAntdSkin().Form).toBeTruthy()
  })
})
