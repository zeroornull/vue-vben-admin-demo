import { describe, expect, it } from 'vitest'

import { vxeTableSize } from '../vxe'

describe('vxeTableSize', () => {
  it('maps compact density to the small table size', () => {
    expect(vxeTableSize('compact')).toBe('small')
    expect(vxeTableSize('default')).toBe('medium')
  })
})
