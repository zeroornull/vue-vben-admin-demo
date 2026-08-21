import { describe, expect, it } from 'vitest'

import { toNaiveTree } from '../naive-tree'

describe('toNaiveTree', () => {
  it('renames title/value to label/key for NTreeSelect', () => {
    expect(
      toNaiveTree([
        {
          children: [{ title: '设计', value: 'd-3' }],
          title: '产品',
          value: 'd-2',
        },
      ]),
    ).toEqual([
      {
        children: [{ key: 'd-3', label: '设计' }],
        key: 'd-2',
        label: '产品',
      },
    ])
  })
})
