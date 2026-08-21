import { describe, expect, it } from 'vitest'

import { toElementTree } from '../element-tree'

describe('toElementTree', () => {
  it('renames title to label for ElTreeSelect', () => {
    expect(
      toElementTree([
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
