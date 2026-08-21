import { afterEach, describe, expect, it } from 'vitest'

import {
  clearSkin,
  getSkin,
  registerSkin,
  requireSkin,
  type SkinAdapter,
} from '../adapter.ts'

function fakeSkin(name = 'fake'): SkinAdapter {
  return {
    Form: {},
    Input: {},
    Modal: {},
    confirm: async () => true,
    controlSize: (density) => (density === 'compact' ? 'small' : 'middle'),
    message: {
      error: () => {},
      info: () => {},
      success: () => {},
      warning: () => {},
    },
    name,
  }
}

afterEach(() => {
  clearSkin()
})

describe('skin registry', () => {
  it('starts empty and requireSkin throws', () => {
    expect(getSkin()).toBeNull()
    expect(() => requireSkin()).toThrow(/not registered/)
  })

  it('returns the last registered adapter', () => {
    registerSkin(fakeSkin('antd'))
    expect(requireSkin().name).toBe('antd')
    expect(requireSkin().controlSize('compact')).toBe('small')
    registerSkin(fakeSkin('ele'))
    expect(getSkin()?.name).toBe('ele')
  })
})
