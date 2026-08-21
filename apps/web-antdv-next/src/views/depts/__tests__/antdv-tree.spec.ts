import { describe, expect, it } from 'vitest'

import { toAntdvTree } from '../antdv-tree'

describe('toAntdvTree', () => {
  it('renames title to label for antdv-next TreeSelect', () => {
    expect(
      toAntdvTree([
        {
          children: [{ title: '设计', value: 'd-3' }],
          title: '产品',
          value: 'd-2',
        },
      ]),
    ).toEqual([
      {
        children: [{ label: '设计', value: 'd-3' }],
        label: '产品',
        value: 'd-2',
      },
    ])
  })
})
