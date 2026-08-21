import { describe, expect, it } from 'vitest'

import { toTdesignTree } from '../tdesign-tree'

describe('toTdesignTree', () => {
  it('renames title to label for t-tree-select', () => {
    expect(
      toTdesignTree([
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
